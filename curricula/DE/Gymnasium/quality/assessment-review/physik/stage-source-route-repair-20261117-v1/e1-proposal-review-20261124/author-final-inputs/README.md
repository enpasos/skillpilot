# Two lower-secondary practice assessments for the remaining CQR-104 gaps (proposal)

Author: agent E (Claude Opus 5.5), 24 November 2026. Status: **author draft, not reviewed**.
Nothing in the repository was changed. The two goal payloads in this directory are complete
canonical goal objects, ready to be inserted after an independent review.

| File | Id | shortKey | Requires = covers | Land gap it is meant to close |
|---|---|---|---|---|
| `exam-hh-motion-laws-from-rest.goal.json` | `161d60bb-b171-50fe-8222-ae7f71a2a5ad` | `canonical_physics_sek1_assessment_motion_laws_from_rest` | `262f807a-30d0-503e-986f-856cbd048e8e` (LAWS) | DE-HH, Sek I |
| `exam-sn-energy-conservation.goal.json` | `8fcedb90-4bab-55dd-9a45-56b7090e7e17` | `canonical_physics_sek1_assessment_energy_conservation_pendulum_trampoline` | `91c49019-ea51-4ce5-a919-c91c45b25e83` (Energieerhaltung) | DE-SN, Sek I, Klassenstufe 7 |

**Id scheme.** `uuid5(uuid5(NAMESPACE_DNS, "skillpilot.io"), shortKey)`, as in the earlier agents'
tool `scratchpad/e1/a/tools/apply_route_repair.py`. The scheme reproduces the ids of LAWS, TV,
FALL, VEC and of the exam `4ea1b93f-2dba-59ac-87ab-29af6c55cc37`. Neither id nor shortKey exists
in the canonical Physics file of `origin/feat/e1-kindeinheiten-nachweise` (863 goals).

**Truth used.** Goal payloads, views and review records were read from
`origin/feat/e1-kindeinheiten-nachweise` (`dd89de7549` and later). Official texts were read from the
retained PDFs in the main checkout (`pdftotext -layout` from `tmp/ci-tools/poppler-root`):

- Hamburg, retained Bildungsplan Physik Gymnasium Sek I, edition **2011** (the extraction id says
  2022; the independent review established 2011):
  `curricula/DE/Gymnasium/input/HH/physik-gym-seki-data.pdf`, SHA-256 `6cd5c797…c4e585`.
- Sachsen, Lehrplan Gymnasium Physik (2004/2019/2025 consolidated):
  `curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf`, SHA-256 `8041a303…412ece9`.

Both tasks are **own practice assessments for existing competencies, not official examination
tasks** and no official task claim. The `reviewNote` of each payload says so in the same way as the
existing own tasks.

---

## 1. Conventions mirrored from the templates

| Point | Decision and template |
|---|---|
| Field set | Identical top-level and `examData` key sets as `4ea1b93f` (newest own Sek I task, same E.1 work): `id, shortKey, title, titleEn, description, descriptionEn, weight, tags, dimensionTags, requires, contains, examples, applicability, extendedData, type, examData{reviewStatus, reviewNote, coveredGoalIds, coveredStrands, demandLevels, taskContent, solutionContent, scoring, taskContentEn, solutionContentEn}`. No `sourceArtifactPath` (as `4ea1b93f`; optional, see §5). |
| Tags, weight, type | `["GK","LK","Practice","Assessment","canonical","SekI"]`, `weight: 1`, `type: "atomic"`, `contains: []`, `examples: []` (as `ef2bb474`, `44ada28b`, `11c964ff`, `4ea1b93f`). |
| Applicability | Copied from the required goal (all 16 Länder) with `extendedData: {applicabilityFromRequires: true, applicabilityMappingInheritance: "boundary"}`, as in all Sek I templates. The actual Land offer is made by `reviewedLowerAssessmentBindings` (see §5). |
| Review status | `reviewStatus: "needs_review"` with a German `reviewNote`, exactly as the unreviewed `4ea1b93f`. |
| Language | German learner text with umlauts, "du" form as `4ea1b93f` (older Sek I tasks use "Sie"). English lives inline in `titleEn`, `descriptionEn`, `taskContentEn`, `solutionContentEn` and in each scoring step as `"<DE> / EN: <EN>"`, as in `4ea1b93f`, `f41e4e30`, `a8dc0290`. There are **no separate language files**: the canonical catalog has only `.de.json` files, and the older Sek I tasks simply lack the EN task fields. Nothing else has to be added for English. |
| g | Stated in the task as the templates do: "rechne mit g = 10 m/s²" (HH, as `4ea1b93f`); "Rechne mit g = 10 N/kg" (SN, the Saxon class-7 form "g ≈ 10 N/kg, g als Ortsfaktor", PDF p. 26). |
| Notation | Plain Unicode formulas (`s = ½ · a · t²`, `m/s²`) as `4ea1b93f`; Markdown tables for data, as in 43 existing exams. |
| Description form | "Die lernende Person kann in einer Prüfungsaufgabe …", no "Formelsammlung" wording. |

### Scoring model (both tasks)

The reviewer of 24 November rejected rubrics that let a learner pass without the covered
competence (`0b8aff9a`: "16/10 permits omitting that item"; `be6d4895`: "30/18 … Bestehen ohne den
7-Punkte-Energieteil"), and AGENTS.md §4 requires that "a missing essential competence must not be
compensated by unrelated points". I therefore used the core-performance model of the released own
task `f41e4e30`:

- every numbered task is one **core performance worth 3 BE**;
- 3 BE: complete and correct; 2 BE: complete with exactly one isolated non-conceptual slip
  (arithmetic, rounding, unit, conversion or reading error); 0 BE: a central component missing or
  a conceptual error (examples are named in each solution);
- pass mark = maximum − 2 (HH 13/15, SN 16/18): at most two slips, and any single 0 makes passing
  impossible (max − 3 < pass). `build.py` asserts this;
- errors carried forward are not penalised again; equivalent correct methods are accepted.

The pass rule is also stated in one sentence at the end of each task text (as `f13ca187` does), so
the learner knows that every task counts. One binary result per exam, as the templates imply.

---

## 2. Hamburg: "Bewegungsgesetze aus Messreihen gewinnen und auf den freien Fall anwenden"

### 2.1 Official source basis

Retained Hamburg 2011, section 3.1 "Anforderungen", topic **"Bewegung und Kraft", PDF and printed p. 20**.
The left column is "Mindestanforderungen am Ende der Jahrgangsstufe 8", the right column
"Mindestanforderungen für den Übergang in die Studienstufe".

Left column (end of year 8):
- "geben die Definition der Geschwindigkeit als Quotient aus Weg und Zeit wieder"
- "unterscheiden gleichförmige und beschleunigte Bewegungen"
- "beschreiben Beschleunigung als Veränderung der Geschwindigkeit"
- "wenden das Weg-Zeit-Gesetz: s = v·t auf gleichförmige Bewegungen an"
- "führen ein einfaches Experiment zur Bestimmung der Durchschnittsgeschwindigkeit eines Körpers durch"
- "interpretieren Zeit-Weg-Diagramme und Zeit-Geschwindigkeits-Diagramme"

Right column (transition to the Studienstufe):
- "stellen die Bewegungsgleichungen s = ½ at² und v = at dar"
- "erläutern den Begriff „freier Fall“"
- "ordnen einer einfachen vorgegebenen Bewegung begründet den Bewegungstyp zu"
- "werten die Bewegung quantitativ aus"
- "wenden die Bewegungsgesetze und die Energieformen auf den freien Fall an"
- "werten gewonnene Bewegungsdaten aus, ggf. auch durch einfache Mathematisierungen"
- "interpretieren und erstellen selbst einfache Zeit-Weg-Diagramme und Zeit-Geschwindigkeits-Diagramme."

The current Hamburg plan (2024, editorial 2022) is not retained in the repository and I had no
network access. The independent review records it at p. 41 ("Bewegungsdiagramme aufnehmen und
auswerten", rest-start equations, acceleration as a change ratio; SHA-256 `b879d9fc…`). I rely on
that record and did not verify it myself.

### 2.2 Design

A toy car drives uniformly along the school corridor (series 1); a cart is released from rest on a
2.0 m inclined track (series 2); both come with a sensor table of t, s and v. The learner classifies
each motion, draws both diagrams, reads both laws from them, explains how the laws are linked and
predicts position and velocity. A last part applies the rest-start laws to a steel ball in a school
free-fall apparatus with g = 10 m/s² given. **No initial velocity in the accelerated motion, no
shifted time origin, no signed areas, no vectors, no square roots** (every prediction is forward in
time; "does the ball arrive?" is checked by evaluating s(0.60 s), not by solving for t).

### 2.3 What each part evidences

| Task | Evidence for LAWS | HH source line |
|---|---|---|
| 1 (series 1) | type with reason; t-s and t-v diagrams; time-position law s = 0.50 m/s · t and time-velocity law v = 0.50 m/s read from the diagrams; relation "slope of t-s = value in t-v" | J8: s = v·t; Diagramme interpretieren; Übergang: Bewegungstyp begründet zuordnen; Diagramme erstellen |
| 2 (series 2) | type with reason; both diagrams; a from the slope of the t-v line; v = a·t; s = ½·a·t² with the found a, checked against ≥ 3 pairs | Übergang: s = ½at², v = at; Bewegungsdaten auswerten, einfache Mathematisierungen; Diagramme erstellen; J8: Beschleunigung als Veränderung der Geschwindigkeit |
| 3 | relation of the two laws: steepening t-s graph because v grows; average velocity = half the final velocity, shown with data, hence s = v̄·t = ½·a·t² | J8: v as quotient of Weg and Zeit, Durchschnittsgeschwindigkeit; Übergang: laws |
| 4 | prediction of position and velocity at a time, for both motion types; plausibility (track length) | Übergang: "werten die Bewegung quantitativ aus" |
| 5 | laws for free fall from rest, values at three instants, arrival check, doubling time → 2× v, 4× s | Übergang: "wenden die Bewegungsgesetze … auf den freien Fall an" |

Together the parts cover the three verbs of the canonical goal ("aus den Diagrammen ermitteln",
"ihren Zusammenhang erläutern", "Ort und Geschwindigkeit zu einem Zeitpunkt vorhersagen") for both
motion types named in it. The independent reviewer noted that `a8dc0290` "does not assess both
uniform and accelerated law extraction from supplied diagrams"; this task does.

**Deliberately left out:** laws with an initial velocity (braking, v = v₀ + a·t), a shifted time
origin, signed areas and displacement versus distance (the reasons why `a8dc0290` was rejected
for Hamburg); the experimental determination of g (successor goal FF `09029573`); the
"Energieformen" half of the free-fall line (not part of LAWS); the meaning of the term "freier
Fall" is supplied as the model in the task text and is not assessed.

**Aspect not evidenced at this level:** if LAWS is read to include uniformly accelerated motions
with non-zero initial velocity (for example braking), this task cannot evidence that part, because
Hamburg's lower stage only supplies rest-start laws. The canonical goal text does not name initial
values, and its accepted image shows a rest start, so I claim the whole goal; the reviewer should
decide (see §6).

### 2.4 Worked solution (all numbers checked in `compute.py`)

1. Equal steps: +0.50 m per 1.0 s, v constant 0.50 m/s → uniform. t-s: line through (0|0) and
   (4.0 s | 2.00 m); t-v: horizontal line at 0.50 m/s. Slope 2.00 m : 4.0 s = 0.50 m/s.
   s = 0.50 m/s · t; v = 0.50 m/s. The slope of the t-s line is the velocity, hence the horizontal
   t-v line at that height.
2. Starts at rest; v rises by 0.20 m/s per 0.5 s; position steps 0.05, 0.15, 0.25, 0.35, 0.45 m grow
   → uniformly accelerated from rest. t-v: line through (0|0) and (2.5 s | 1.00 m/s);
   a = 1.00 m/s : 2.5 s = 0.40 m/s²; v = 0.40 m/s² · t; s = ½ · 0.40 m/s² · t² = 0.20 m/s² · t².
   Check: 1.0 s → 0.20 m; 1.5 s → 0.45 m; 2.0 s → 0.80 m; 2.5 s → 1.25 m (all equal the table).
   Equivalent: s : t² = 0.20 m/s² for every pair, so a = 0.40 m/s². The t-s graph is an upward
   curve starting horizontally at the origin.
3. Slope of t-s at an instant = velocity then; v grows steadily, so t-s gets steeper (0 at 0 s,
   1.00 m/s at 2.5 s). Average velocity 0…2.0 s: 0.80 m : 2.0 s = 0.40 m/s; v(2.0 s) = 0.80 m/s, twice
   as large. v grows evenly from 0 to a·t, so v̄ = ½·a·t and s = v̄·t = ½·a·t².
4. Car: s(10 s) = 5.0 m, v = 0.50 m/s. Cart: v(3.0 s) = 1.2 m/s, s(3.0 s) = 1.8 m < 2.0 m, still on
   the track.
5. v = 10 m/s² · t, s = 5 m/s² · t². 0.20 s: 2.0 m/s, 0.20 m; 0.40 s: 4.0 m/s, 0.80 m; 0.60 s: 6.0 m/s,
   1.80 m → arrives after 0.60 s at 6.0 m/s. v ∝ t (2.0 → 4.0 m/s), s ∝ t² (0.20 → 0.80 m, factor 4).

Realism: a low-friction cart reaches 0.40 m/s² on a slope of about 2.3°; a toy car at 0.50 m/s; a
1.80 m school free-fall apparatus. With g = 9.81 m/s² the ball would need 0.606 s (1.77 m at
0.60 s); the task prescribes 10 m/s².

### 2.5 Prerequisite knowledge used, mapped to the closure

`npm run knowledge-context -- 262f807a… --full` (worktree) lists 62 secured goals; my own closure
computation on the remote branch gives **66 prerequisite atoms of the task including LAWS
(9 Physics, 57 Mathematics)**, the same set the independent review lists for `a8dc0290` in `hh-st/native-preparation.actual.json`, all
with a real lower acquisition placement in `de-hh-seki.view.json`.

| Task demand | Closure goal(s) |
|---|---|
| read tables, axes, units; draw points and lines | `80c232f1` Achsen, Skalen und Einheiten lesen; `25593605` Punktlagen … im Koordinatensystem darstellen; `ae67bcf1` Bewegungen mit Weg-Zeit-Diagrammen beschreiben; `ce431132` DIA |
| uniform motion, v = Δs/Δt, slope of a line | `971beafa` GLF; `13b338eb` Messwertänderungen pro Zeitintervall; `af3d6bff` Lineare Funktionen beschreiben; `f3167cab` Proportionale Funktionen als Ursprungsgeraden |
| accelerated motion, a as slope of the t-v line | `e4b38061` BES; `f3167cab` |
| average versus instantaneous velocity, slope of t-s as velocity | `bf8517a9` DM |
| evaluate ½·a·t², squares of decimals, units | `f08d06dc` Terme mit Variablen lesen und deuten; `d658e26a` / `26f668a0` Potenzen; `c65ecabf` Funktionswerte berechnen; `ee48e811` rationale Zahlen multiplizieren; `ca623958` einheitengerecht rechnen |
| check s : t² = const | `c1f50bcc` Proportionale Zusammenhänge mit Quotientengleichheit prüfen |
| free fall | only LAWS itself with a = g supplied; FF `09029573` (a successor of LAWS) is **not** needed |

`1e459a1b` TV (signed area) is in the graph closure but is not demanded; the triangle-area argument
is only accepted as an alternative in task 3.

### 2.6 Why the task stays inside Hamburg's lower stage

Every demand maps to a quoted line on p. 20 (table in §2.3). The mathematics is year 5–7 (proportional
functions, powers, quotient equality). The only step that is not printed literally is the explanation
in task 3. Its ingredients are printed: average velocity and v = Δs/Δt (J8), v = at and s = ½at²
(Übergang). Linking them is the canonical goal's own demand. This is my didactic judgement, not
an official claim.

---

## 3. Sachsen: "Energieerhaltung an Fadenpendel und Trampolin bilanzieren"

### 3.1 Official source basis

Klassenstufe 7, **Lernbereich 3 "Energiewandler" (10 Ustd.), PDF p. 28 / printed p. 16**:
- "Anwenden der Energieformen beim Beschreiben von Energieumwandlung bzw. Energieübertragung –
  kinetische und potentielle Energie, thermische Energie, chemische Energie, elektrische Energie";
  right column: "Mensch als Energiewandler"
- "potentielle Energie E_pot = F_G · h" – right column: "quantitative Vergleiche"
- "Anwenden des Gesetzes von der Erhaltung der Energie auf Beispiele aus der Mechanik" – right column:
  "Beachten der Gültigkeitsbedingungen, Perpetuum mobile, Fadenpendel, Achterbahn, Trampolin,
  Wasserfall, Turbinen im Wasserkraftwerk, Pumpspeicherwerk"
- "Einblick gewinnen in den Wirkungsgrad von Energiewandlern" – "Energiebilanzen", "Verringern des
  Energieaufwands durch Verkleinern der Reibung"

Klassenstufe 7 aims, PDF p. 25 / printed p. 13: "Die Lageenergie und die Leistung können sie
quantitativ erfassen."; "… indem sie Skizzen anfertigen und zur Lösung Wertetabelle und Diagramm
verwenden"; "Auf der Grundlage von Modellvorstellungen und bekannten Gesetzen üben sie sich im
Formulieren von Vermutungen bzw. Voraussagen."
Klassenstufe 7, LB 1 "Kräfte", PDF p. 26 / printed p. 14: "Gewichtskraft, g ≈ 10 N/kg", "g als
Ortsfaktor"; friction with "Luftwiderstand".

**Quantitative tools a class-7 learner does not have** (checked in the full text):
- E_kin = (m/2)·v², W = F·s, E_sp = ½·D·s² and "abgeschlossene und offene Systeme" appear only in
  Jahrgangsstufe 11 Grundkurs, LB 1 "Erhaltung der Energie", PDF p. 47 / printed p. 35;
- F = m·a and the Newton laws: Klassenstufe 9, PDF p. 37 / printed p. 25;
- Q = m·c·ΔT (thermal energy quantitatively): Klassenstufe 8, LB 2, PDF p. 31 / printed p. 19.

In the canonical closure of `91c49019`, "Kinetische Energie" (`7eeff2de`, ½mv²) and "Potenzielle
Energie (Lageenergie)" (`6affc2ea`) are **not secured**. The task therefore (a) supplies
E_pot = F_G · h and 1 N·m = 1 J in its material, (b) gives the weight forces directly (5.0 N, 400 N)
next to the masses, and (c) says that kinetic and elastic energy are found only from the energy
balance. No formula for kinetic or elastic energy is needed anywhere.

### 3.2 Design

Part A uses the string pendulum named in the source (with a measured turning height that the
learner compares with the prediction, and the classic nail variant); part B uses the trampoline,
also named in the source, with a perpetual-motion claim and the human body as an energy converter.
A one-line invitation to try the pendulum at home with a bunch of keys reflects the 23 November rule
on experimental content; it is explicitly not graded.

### 3.3 What each part evidences

| Task | Evidence for `91c49019` | SN source |
|---|---|---|
| 1 | state the law **and its condition** (no energy transfer across the system boundary; energy only converted); qualitative conversion chain A → B → C | "Anwenden des Gesetzes von der Erhaltung der Energie", "Beachten der Gültigkeitsbedingungen", "Energieumwandlung bzw. Energieübertragung", "Fadenpendel" |
| 2 | quantitative balance at A, D, B in a frictionless closed system; prediction of C; comparison with the measured 19.8 cm | "E_pot = F_G · h", "quantitative Vergleiche", "Energiebilanzen", aims: Wertetabelle, Voraussagen, Prüfung von Ergebnissen |
| 3 | prediction with the law where intuition fails (nail pendulum): height is fixed by energy, not by path | "Fadenpendel"; aims: "Voraussagen" from known laws |
| 4 | validity condition: the real pendulum system (ball, string, Earth) is not closed; energy goes to air and suspension; a larger system conserves the total | "Beachten der Gültigkeitsbedingungen", "Energieübertragung", "thermische Energie"; LB 1 friction/Luftwiderstand |
| 5 | balance with three forms (potential, kinetic, elastic) at three points, constant sum | "Trampolin"; "E_pot = F_G · h" |
| 6 | perpetual-motion claim refuted with the law; chemical energy of the muscles converted inside the system | "Perpetuum mobile", "Mensch als Energiewandler", "chemische Energie" |

Both halves of the goal ("für ein System, über dessen Grenze keine Energie übertragen wird, die
Energieerhaltung formulieren" and "einfache Umwandlungen zwischen Energieformen bilanziell
beschreiben") are each required by at least two independent cores, so no single slip lets a learner
pass without them.

**Deliberately left out:** any formula for kinetic or elastic energy, speeds, work W = F·s, efficiency
and power (separate class-7 goals with their own tasks), a quantitative friction balance (task 4 is
graded qualitatively only, see the successor goal "Reibungsenergie" `253a71d2` in §6), the formal
GK-11 vocabulary of open and closed systems (accepted, not required), and electrical energy chains
(the mapping review of 24 November says the conservation row does not carry them).

### 3.4 Worked solution (all numbers checked in `compute.py`)

F_G = 0.500 kg · 10 N/kg = 5.0 N; reference level B.
1. In a system with no energy transfer across its boundary the total energy stays constant; energy
   is only converted. A→B: potential → kinetic (maximum at B); B→C: kinetic → potential; at rest in A, C.
2. E_pot(A) = 5.0 N · 0.200 m = 1.0 J. B: 0 J + 1.0 J. D (5.0 cm): 0.25 J + 0.75 J. Sum 1.0 J everywhere.
   Prediction C = 20.0 cm; measured 19.8 cm is 0.2 cm (1 %) lower: fits within reading accuracy and
   small losses (E_pot = 0.99 J).
3. 20.0 cm again: at the turning point E_kin = 0, so E_pot = 1.0 J and h = 1.0 J : 5.0 N = 0.20 m,
   whatever the path. (Check: nail radius 0.50 m > 0.20 m, so the string stays taut; the turning
   point is at 53° around the nail; without nail the release angle is 37°.)
4. Not refuted. For ball, string and Earth the condition fails: air resistance and friction at the
   suspension transfer energy to the air and the suspension (thermal energy), so the pendulum's
   mechanical energy falls (from 1.0 J to 0.70 J; the number is not asked). For a larger system with
   air and suspension, e.g. the whole closed room, the total is conserved: the mechanical decrease
   equals the thermal increase.
5. F_G = 400 N; reference T; H is 1.00 m + 0.50 m = 1.50 m above T.
   H: 600 J + 0 J + 0 J; K (0.50 m above T, bed unstretched): 200 J + 400 J + 0 J; T: 0 J + 0 J + 600 J.
6. False: in the closed system without friction the sum stays 600 J and every highest point is a
   rest point, so at most 1.50 m above T again (really a little lower). Rising without own work
   would create energy from nothing: a perpetual motion machine, impossible. Pushing with the legs
   converts chemical energy from food in the muscles into mechanical energy; with the child inside
   the system this is a conversion and the total stays constant.

Realism: string pendulum period ≈ 2.0 s, about 90 swings in 3 minutes; 30 % loss over that time is
plausible. Trampoline: implied bed stiffness 4800 N/m, static sag of the standing child 8 cm, peak
bed force 2400 N (6 × weight) – plausible for a vigorous 1 m bounce. The kinetic energy at K
(400 J) is not the maximum (417 J slightly below K); the task does not ask for the maximum.

### 3.5 Prerequisite knowledge used, mapped to the closure

`knowledge-context -- 91c49019… --full` (worktree) lists 68 secured goals; my closure computation
on the remote branch gives **72 prerequisite atoms of the task including the target `91c49019`
(16 Physics, 56 Mathematics)**, counted like the reviewer's P, all present with an acquisition or
target placement in `de-sn-seki.view.json`.

| Task demand | Closure goal(s) |
|---|---|
| name and distinguish Lage-, Bewegungs-, Spannenergie; which one rises or falls | `722857cf` Mechanische Energieformen qualitativ unterscheiden |
| mechanical energy as the sum of kinetic and potential energy | `94784e0a` Mechanische Energie |
| weight force as a force (values given) | `5ea765ac` Kräfte und Trägheit qualitativ erklären |
| unit conversion g → kg, cm → m; products and differences of decimals | `f2e42af5` Größen und Einheiten vergleichen und umrechnen; `ca623958` einheitengerecht rechnen; `ee48e811` / `4eeab7d5` rationale Zahlen |
| E_pot = F_G · h, g = 10 N/kg, 1 N·m = 1 J | **supplied in the task text** (not secured in the closure) |

Not used although in the graph closure: `c1c71daa` Mechanische Arbeit als Energieänderung,
`5f289cdc` Grundgleichung, `a94cfe1c` Newton 2 (vector momentum form), `31a2ef52` Newton 1,
`e4b38061` BES, `1e459a1b` TV, Mathematics J9 (Pythagoras, trigonometry, Strahlensatz).

### 3.6 Why the task stays inside Saxony's class 7

Every demand maps to a quoted line of LB 3 (table in §3.3), and the arithmetic is year 5–6. The
only formula is the class-7 formula E_pot = F_G · h, and the task supplies it. The task asks for
no kinetic-energy, work or thermal-energy formula. The system language of tasks 1 and 4 is plain
("Energie wird an die Luft übertragen"; "größeres System"), not the GK-11 open/closed-system
terminology.

---

## 4. Files of this proposal

- `exam-hh-motion-laws-from-rest.goal.json`, `exam-sn-energy-conservation.goal.json`: the payloads.
- Scratch (author's working files, not for the repository):
  `/tmp/claude-1000/-home-enpasos-projects-skillpilot/3bff852e-c33a-4d0f-8d8a-670213c2fcc3/scratchpad/e1/e/`
  with `compute.py` (exact-fraction recomputation of every number, with asserts; output
  `compute.out`), `build.py` (generates both payloads from the canonical file and asserts ids,
  points, the pass rule and the BE annotations), `log.md`, the PDF text extractions under `src/`
  and the knowledge-context outputs `kc-laws.txt`, `kc-energy.txt`. Both payloads validate against
  `docs/landscape-runtime.schema.json` when inserted into a scratch copy of the canonical file.

## 5. Integration (for the integrator; kinds only, nothing computed)

1. **Canonical file.** Insert both objects verbatim into `goals` of
   `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json` (suggested: after
   `4ea1b93f`), and append both ids to `contains` of the cluster "Übungen Sekundarstufe I Physik"
   `21ab0854-4d67-5233-9495-ae208e152a3c`. Its applicability already lists all 16 Länder, so the
   compiled union is unchanged. Goal count 863 → 865.
2. **Do not** add a `goalPlacements` entry for either exam to `physics-constant-acceleration` or to
   any E.1 child unit. The HH exam requires LAWS. As an own assessment of an E.1 unit it would
   change that unit's recognition contract (R1–R5) and the A–D assignment. Verify afterwards that
   the E.1 pilot position counts (16/17 or their post-cut values) did not change.
3. **Land offer.** `scripts/generate_laender_physics_stage_views.sources.json` →
   `reviewedLowerAssessmentBindings.HH` gets `161d60bb…` and `.SN` gets `8fcedb90…`, each with
   `requires` and `coveredGoalIds` equal to the target goal. They also need `sourceClaim` ("Own
   reviewed bounded assessment offering of existing competencies; no official Land task claim."),
   `ensureCrossStageExposure`, `courseProfiles` and the paths of the independent content review and
   offer review, following the existing entries. Then update
   `scripts/generate_laender_physics_stage_views.memberships.json` and the pinned sets in
   `scripts/test_generate_laender_physics_stage_views.py` (per-Land assessment sets and the
   task → requires map), regenerate the Physics views and rerun CQR-104. Expected, not computed:
   the HH contexts and the SN `91c49019` contexts listed in the remote README close. `accb1d9e` and
   `b1808b4c` in the SN views stay open.
4. **Ledgers and pinned counts** touched by the precedent commit `485f856dcd` (which added
   `4ea1b93f`): `curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json`
   (`semanticKind: practiceAssessment` with a fresh `sourceFingerprint`),
   `docs/legal/ai-transparency-inventory.json` (`canonicalGoalCount`),
   `app/scripts/testPhysicsGoalBookInputs.ts`. Also check `app/scripts/testPhysicsAssessmentProjection.ts`,
   backend tests with fixed Physics counts, `quality:curriculum-status` (no maturity drop; raise
   pins on gains) and the Physics rollout or source-rationale reports, if they count exam goals.
5. **Reviews before release.** These are an independent content review (DE and EN, numbers,
   rubric), a coverage review (can a learner pass without any part of the target goal?) and a
   source-stage review per Land (HH lower stage; SN class 7 and Sek I closure). Only then set
   `reviewStatus: "released"` and replace the `reviewNote` with the review references, as for
   `f41e4e30`. An optional `sourceArtifactPath` (Markdown copy under
   `curricula/DE/Gymnasium/assessments/physik/…`) follows `f41e4e30`/`a8dc0290` and is not required
   (`4ea1b93f` has none). No learner results are written or transferred.

## 6. Open points and doubts (reviewer: please look at 1 first)

1. **SN closure contract, likely blocking.** The task itself uses only class-7 content. The graph
   closure of `91c49019` is a different matter. It contains `a94cfe1c` "Newtons 2. Axiom" in its
   vector-momentum form, `5f289cdc` Grundgleichung, `c1c71daa` Mechanische Arbeit als
   Energieänderung, `e4b38061` BES, `1e459a1b` TV and Mathematics J9 (Pythagoras, trigonometry,
   Strahlensatz). The path runs through `94784e0a` Mechanische Energie → `c1c71daa` → `5f289cdc` →
   `a94cfe1c`. In `de-sn-seki.view.json` the generator places these as `prerequisiteOnly`
   acquisition entries in "Jahrgangsstufe 7 > Energiewandler" (and BES and TV under "Jahrgangsstufe
   6 > Farben"). Saxony teaches F = m·a in class 9 and W = F·s in GK 11. In the circle review of
   24 November the same reviewer treated `a94cfe1c` as a blocking preparation needing its own
   source-stage proof. If that standard applies here, **no** task that requires `91c49019` can close
   the SN gap without a separately authorized contract repair of the prerequisite chain, for example
   the `94784e0a → c1c71daa` edge. That repair is outside my mandate and I did not attempt it.
2. **HH coverage scope.** The claim "covers LAWS" rests on reading LAWS as rest-start plus uniform
   motion (see §2.3). If the reviewer reads LAWS as including initial velocities, the HH binding
   needs a bounded wording, or the coverage claim does.
3. **HH task 3** ("average velocity is half the final velocity, hence s = ½at²") is my didactic bridge
   from quoted ingredients, not a printed Hamburg requirement. The current 2024 plan was not
   readable offline.
4. **SN task 4** names a larger system and mentions thermal energy from air resistance and friction.
   It is graded only qualitatively. It touches the successor goal "Reibungsenergie" (`253a71d2`),
   and the GK-11 line "abgeschlossene und offene Systeme". I consider it the class-7 "Beachten der
   Gültigkeitsbedingungen". If the reviewer disagrees, the minimal fix is to drop "und gib ein
   größeres System an …" and keep "welche Bedingung … nicht erfüllt ist".
5. **Spannenergie** is not in the SN class-7 list of energy forms (p. 28 lists kinetic, potential,
   thermal, chemical and electrical energy), but "Trampolin" is a named example there, and the closure goal
   `722857cf` names Spannenergie. The task treats it only through the balance.
6. **Strictness.** 3/2/0 cores with pass at max − 2 (13/15, 16/18) mirror `f41e4e30`'s
   no-compensation rule. For class 7 this is demanding. A softer variant (for example 4/3/0 with pass
   at max − 2) would keep the no-compensation property.
7. **Applicability** is all 16 Länder via `applicabilityFromRequires`, as for the other Sek I tasks.
   The alternative is a restricted `applicabilityOverrides`, as `f41e4e30` (HE, SN) uses.
8. **Minor:** "du" instead of "Sie"; demand levels (HH AB2 with AB1–AB2, SN AB3 with AB1–AB3) are my
   judgement; diagram drawing is replaced by a precise description in chat (stated in the task and
   the scoring notes); estimated working time 35–45 min (HH) and 30–40 min (SN). I authored these
   tasks and did not review them myself.
