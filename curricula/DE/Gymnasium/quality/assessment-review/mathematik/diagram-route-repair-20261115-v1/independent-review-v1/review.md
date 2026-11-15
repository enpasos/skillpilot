# Independent assessment-content review — frozen diagram-route candidate v1

Decision: **changes required; not ready to activate or apply as a released assessment package**. The mathematical stimuli, solutions and bilingual task wording are sound. The proposed total-score rules still permit passing answers that contradict, or never demonstrate, indispensable understanding. The narrow Task-5 deletion is independently justified and may be applied as that correction; it does not depend on approving the four new exams.

This is an actual AI review, not a human approval, learner experiment, CI result, or semantic-register activation. No canonical, runtime, mapping, quality-ledger, retained-source or frozen-package file was edited. No learner result was written or transferred.

## Session and inputs

- Reviewer spawn selection supplied by the parent: `gpt-6.1-sol`, reasoning effort `ultra`, `fork_turns: none`. The exact provider backend build, sampling controls, temperature and seed were not exposed. This statement records the supplied selection, not a separately measured backend identity.
- The first persisted verification timestamp is `2026-11-15T05:07:53.656172+00:00`. The actual completion timestamp is recorded in `review-receipt.actual.json` after writing this review.
- Frozen root: `tmp/math-diagram-route-20261115/draft/frozen-review-v1/`.
- Entry SHA-256: `b64fdeea7084408ae344513a7eed4ae18930973df48a231e0b17e90df6233ff9`.
- Assessment definitions SHA-256: `3876c0b10de1a0534e21367af5715b63e3b88bac4d47a6f30884f4bc9328754d`.
- Asset manifest SHA-256: `0f7891c9cc81ae27372445d45b650683ebfe283570e868635652e8550e3fc39e`.
- All **57/57** pinned files matched both byte length and SHA-256. All **8/8** live repository input pins also matched at review time. All six goal/task/parent snapshots and all four positive-profile JSONL records were compared with the current repository and matched exactly. The active rollout configuration still references that profile configuration.
- Evidence files in this directory record every pinned input, the supporting current contracts, independent calculations and the 24 images actually opened.

I read the reviewer instructions, source/scope note, all four ordinary goal descriptions, all four current P records, all eight DE/EN Markdown files, all embedded task/solution/scoring fields, the coverage map, proposed Task 5, edit plan, blueprint and generator diff. I used the author technical report only as a description of claimed checks, not as independent approval. I inspected all eight full-size PNGs through `view_image`, then every actual 360- and 680-pixel rendering through `view_image` (24 images total).

## Essential-expectation interpretation

The current Mathematics P review criteria say that the cases **together** cover all required expectations, with at least one direct demonstration and one structurally changed independent transfer. I do not add a requirement that every minor rubric sub-item must be perfect twice. A missing endpoint qualifier or a single arithmetic slip is not automatically a missing competence. Conversely, an explicitly wrong core distinction or the complete absence of an indispensable explanation cannot be repaired by unrelated arithmetic points.

The four current P records remain `needs_human_review` / `ai_candidate`. This review uses their declared expectations; it neither promotes them to human standards nor rewrites them. Its findings below concern concrete tasks and passing rules, not whether schema-valid metadata exists.

## Blocking findings and exact scoring counterexamples

The point assignments below follow the announced independent one-point sub-items. They are reviewer-constructed answer patterns, not observed learner results or automated semantic scoring. A scorer must not secretly withhold other earned points or add an undeclared pass veto to defeat these examples. Current OpenAI V1 submission handling checks the total against `passingPoints` (`OpenAiDeV1McpContractAdapter.java`, around lines 2184–2193); the frozen candidate itself also states that only totals are enforced.

### R1 — required category/quantity distinction can be explicitly denied and still pass, 15/16

Location: `assessment-definitions.json`, `f4fda40d…`, `axes-b-axis`, lines 87–107. P expectation: `axis-role`.

Give this otherwise complete answer:

> A: Waagerecht ist Zeit in h; von 0 nach 2 sind es 2 h. Senkrecht steht Volumen in L; von 0 nach 20 sind es 20 L. 3 h liegt mittig zwischen 2 und 4 h. Wegen des geraden Verlaufs sind es für A 55 L und für B 50 L; A hat 5 L mehr.
>
> B: Beide Achsen sind Größenachsen; eine Kategorieachse gibt es hier nicht. Waagerecht steht der Geldbetrag. Eine Einheit der abgelesenen Zahl entspricht 100 EUR; die Zahl zählt Hunderter. Bus: 2,5 · 100 EUR = 250 EUR. Material: 4 · 100 EUR = 400 EUR. Unterschied: 150 EUR.

| Criterion | Earned | Reason |
| --- | ---: | --- |
| `axes-a-axis` | 4/4 | Correct quantities, units and scale steps. |
| `axes-a-value` | 4/4 | Correct intermediate readings, reasoning and comparison. |
| `axes-b-axis` | 3/4 | Category identification fails; money axis, multiplier and hundreds explanation succeed. |
| `axes-b-value` | 4/4 | Correct readings, difference and explicit conversion. |
| Total | **15/16** | Passes 13; the required category-axis distinction is explicitly contradicted. |

Case A has two quantitative axes and cannot supply the missing category/quantity distinction elsewhere. The two multiplier sub-items in `axes-b-axis` mostly repeat the same explanation, while categorical meaning has only one point. This makes the semantic imbalance especially clear.

Repair: make an adequately demonstrated category/quantity distinction indispensable under the declared score rule. Reduce redundant credit for restating the same unit multiplier. Preserve ordinary partial credit for other readings and valid equivalent explanations; do not add a retrospective all-or-nothing veto.

### R2 — certain continuation and pump causation can be asserted and still pass, exactly 21/24

Location: `assessment-definitions.json`, `d9c49084…`, `trends-b-context`, lines 198–229. P expectation: `contextual-trend`, including its explicit boundary against automatically explaining causes.

An answer can correctly state all of the following:

- A has 60 L at 4 h; its intersections with B are (2 h, 50 L) and (6 h, 50 L), each meaning equal volume. A changes at (60−40)/4 = +5 L/h and (50−60)/2 = −5 L/h; B has 0 L/h. A is below B before 2 h, equal at 2 and 6 h, above B between them; all of these statements concern 0–6 h.
- C has 50 L throughout the closed interval 1–3 h. Its rates are (50−20)/1 = +30 L/h, (50−50)/2 = 0 L/h and (30−50)/2 = −10 L/h. It increases, stays constant and then decreases in the displayed sections.

Then answer question 4:

> Ja, beide Teile sind bewiesen: Weil der letzte Abschnitt abwärts geht, wird C nach 5 h bestimmt weiter geleert und eine Pumpe läuft.

The first five four-point criteria yield 20 points; the correct displayed rise/plateau/fall yields the first point of `trends-b-context`. The other three sub-items fail. Total: **21/24**, an announced pass despite the exact causal and extrapolation misconception the profile and question are supposed to distinguish.

Repair: weight a minimally adequate, justified separation of displayed trend, future behavior and cause so its absence or explicit contradiction cannot fit within the three-point loss allowance. It should remain possible to earn partial credit for correct rates and interpretations without claiming mastery prematurely.

### R3 — the reason for a clearer representation can be absent in both cases, 14/16

Location: `assessment-definitions.json`, `57bf531d…`, `correction-a-alternative` and `correction-b-alternative`, lines 430–451. P expectation: `clearer-alternative` explicitly includes explaining why the intended comparison becomes clearer.

Give correct, understandable explanations and numerical corrections to questions 1 and 3 (8/8). For question 2 specify only:

> Gleich breite Säulen A=40 L und B=60 L; waagerecht A/B; senkrecht Volumen in L, linear von 0 bis 70 in 10-L-Schritten; die Säulen tragen die direkten Wertangaben 40 L und 60 L.

For question 4 specify only:

> Gleich breite Balken auf einer gemeinsamen linearen Achse von 0 % bis 100 % in 10-%-Schritten: A=60 %, B=45 %. Beschriftungen: A — 24 von 40; B — 27 von 60.

These are drawable, retain the required values and bases, and satisfy the first three points of each alternative criterion. Neither answer explains the advantage of its proposed representation. Thus `4 + 3 + 4 + 3 =` **14/16**, above the 13-point threshold. The explanation of an original misreading is a distinct observable act from connecting the proposed representation to its clearer comparison; the supplied rubric explicitly separates them, as does the P expectation.

A second, more severe boundary case reaches **13/16**: all of Case A and the Case-B explanation are correct (12 points), but the proposed Case-B alternative is “Ich zeichne die ursprüngliche Anzahlgrafik unverändert noch einmal, einschließlich 24/27 und 40/60.” Only the data-preservation point of `correction-b-alternative` is earned (1/4). The total still passes with no suitable second alternative. This additionally defeats a claim that the exam requires two complete performances of the compound explain-and-redesign goal. I do not use this second example to impose every minor expectation twice.

Repair: retain analytic partial credit, but ensure that minimally adequate explanation of the representation choice is indispensable to the pass and that mere preservation of numbers cannot stand in for a coherent alternative. A correct labelled table remains valid. No particular diagram type should become mandatory.

### R4 — claims exam has a weaker case-level evidence pattern than the omission bound suggests

Location: `assessment-definitions.json`, `c76fae5e…`, `claims-a-distortion`, lines 319–334.

An answer can correctly reject the triple claim using 40 L, 60 L and 60/40=1.5 (4/4); then merely list “Achsenbeginn 30 L; sichtbare Höhen 10 und 30” (2/4), with no explanation of the visible ratio versus full-volume ratio and no purpose-dependent assessment of cropping. A complete Case B earns 8/8, giving **14/16**. At threshold, merely naming the 30-L start (1/4) gives 13/16.

This is a concrete limitation of the advertised whole-group omission proof: some credit in a group is not a complete positive demonstration of that mechanism. Unlike R1–R3, this example alone does not establish that the package-wide required expectation is wholly absent: Case B can demonstrate `distorted-comparison`, and the P criteria permit joint coverage. The author should nevertheless avoid claiming that the current bound proves two fully explained cases. Include this answer pattern when revising and reviewing the scoring of all four exams.

## Mathematics, language and visuals

Independent exact calculations, also recorded in `independent-calculations.actual.json`:

| Stimulus | Verified result |
| --- | --- |
| Water A/B | At 3 h: A=55 L, B=50 L, difference 5 L. A maximum 60 L at 4 h. Equal at (2 h, 50 L) and the displayed endpoint (6 h, 50 L). A rates +5 and −5 L/h; B 0 L/h. |
| Budget | 2.5 × 100 EUR=250 EUR; 4 × 100 EUR=400 EUR; difference 150 EUR. |
| Plateau C | Maximum 50 L on the entire closed interval [1,3] h; rates +30, 0 and −10 L/h. |
| Truncated columns | Actual ratio 60/40=1.5, difference 20 L. Visible heights above 30 L are 10 and 30; their ratio is 3. |
| Unequal time marks | Two increases of 10 L over 1 h and 4 h; rates 10 and 2.5 L/h. |
| Participation | A: 24/40=60%; B: 27/60=45%. B has 3 more participants, A has 15 percentage points more. The latter difference is explicitly optional. |
| Stable algebra Task 5 | T(30)=89 EUR; 3(n+4)−2n=n+12, hence 42 at n=30. |

All eight full-size images and all 16 responsive renditions preserve these values. Water A/B is distinguishable by solid/dashed strokes and labels as well as color. Plateau time positions 0,1,3,5 have the correct linear distances; the deliberately flawed chart's 0,1,5 marks are equally spaced as intended. Budget bar ends are at 2.5 and 4. Truncated and zero-baseline columns retain 40/60 and equal widths. Count and percentage charts retain 24/27, 40/60 and 60/45 respectively. At 360 pixels, title/axis labels and group-size labels remain legible, with no clipping or overlapping numerical labels. At 680 pixels there are likewise no defects. The solution images are correctly separated from task image references.

DE/EN tasks, solutions and Markdown rubrics have equivalent mathematical demands, units, interval bounds, optional statements and accepted alternatives. English solution C omits the expanded arithmetic expressions but gives the same correct rates; this does not change the demand. The combined bilingual diagram labels are semantically adequate.

The original graphs are invented models, not measured data. Straight-segment interpolation is explicitly defined, so 55 L at 3 h is warranted. Constant volume does not imply no inflow/outflow. The solutions properly distinguish value, rate, equality, full amount, visible height and share; they do not infer intent, causes or later values from the display alone.

## Scope, variation, exposure and learner contracts

- Every new exam has one direct ordinary prerequisite and the same sole direct `coveredGoalIds` entry: axes → `80c232f1…`; trends → `496f16a0…`; claims → `fcfbff12…`; correction → `d668c22d…`. No larger Analysis, percentage, source-standard or prerequisite mastery claim is supported by the supplied arithmetic definitions and calculator. These are task scaffolds; they do not repair absent learner mastery or justify adding covered goals.
- The cases vary mathematically consequential features: two numerical axes versus horizontal categories with a unit multiplier; two intersecting series versus a single plateau; full-amount comparison under an axis crop versus rates under unequal time intervals; full amount versus share with different group sizes. These are more than cosmetic number changes.
- The concrete candidate does **not** test negative temperature scales or pictogram areas. I do not treat examples in the existing profiles as new mandatory atomic goals. Neither may the integration report mark these named profile example forms as exercised. The broader goal scope remains unchanged.
- Within each exam, the two cases have independent data and do not depend on earlier numerical answers. Across the four exams, water A/B is reused, and claims Case A and correction Case A share the very same chart, claim and numbers. A learner who saw the earlier solution has already seen that numerical correction. Do not call that response fresh exposure-independent evidence, and do not count solution-exposed retries as new independent demonstrations. The redesign act and the changed second cases still require new work. This package review contains no learner-exposure record and cannot prove a learner's fresh transfer.
- Normal task content contains the stimuli, general arithmetic definitions and questions, not either solution-only image or the answer paragraphs. The separately named `sourceArtifactPath` Markdown files contain evaluation material after an explicit heading; they are author artifacts, not access-controlled learner delivery. Static asset URLs are not authenticated. No security or runtime-isolation approval is inferred from textual separation.
- The proposal's `needs_review`, inactive semantic proposal, stable goal IDs and no-transfer policy are honest. New assessment metadata and new prerequisites must not themselves write ordinary mastery. Preserve the frozen V9 proof, old reviews and all existing learner-result contracts. Current semantic classifications, affected native fingerprints and actual current validators remain integration work; the author receipt does not authorize them.

## Primary-source scope check

I opened the cited primary sources live during this review. The [LISUM diagnostic and support material](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/rlp-online/Teil_C/Mathematik/Materialien/Ma_MzDuF_L5__Daten_und_Zufall_Gesamt_2023-05.pdf) supports the modest didactic rationale: its conceptual pages connect reading, statistics and statement validation; its data guidance uses relative frequencies to compare differently sized samples and ties display/axis choices to the data. Its introduction distinguishes diagnosis from subsequent support. The [IQB task catalogue](https://www.iqb.hu-berlin.de/de/schule/aufgaben/seki/lernaufgaben-mathematik/) has filters for process/content competencies and instructional phases. These sources do not approve the new tasks, establish SkillPilot effectiveness, or assign all four goals to J7 in every Land. The candidate correctly avoids those claims. J7 is the current canonical placement, not an invented nationwide source attribution.

## Task 5 and integration boundary

I compared the entire proposed Task-5 object against current canonical Task 5. Its **only** differences remove `d668c22d-caeb-5e91-8980-721c931a2bcf` from `requires` and `examData.coveredGoalIds`. ID, algebra task, solution, scoring, two actual algebra prerequisites/coverages, source locator and other metadata remain unchanged. Explaining a distributive-law error does not demonstrate explaining a diagram misreading. The deletion corrects a false claim and does not convert historical algebra results into diagram results.

The proposed blueprint removes that false coverage and explains that the four new endpoints do not enlarge the 60-minute task set. The generator diff removes the false relationship on replay and the obsolete approval reservation; its other historical baseline behavior must not be applied wholesale. The four draft nodes match the edit plan; there are no ordinary-goal/edge edits. The parent proposal appends those four IDs and changes its weight from 9 to 13.

Proceed with the justified narrow deletion if integrating it separately. Repair R1–R3, exercise R4 and the other adversarial answer patterns against the revised scoring, freeze a new candidate and obtain a new independent content decision before marking new exams released. A revised content pass still needs native semantic/source/projection checks, unchanged protected quality floors, integration to `main` and a fresh fully successful CI run. None of those later outcomes is claimed here.
