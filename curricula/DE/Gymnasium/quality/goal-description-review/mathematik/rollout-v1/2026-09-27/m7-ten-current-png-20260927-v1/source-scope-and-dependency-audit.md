# Source-scope and dependency audit: 18be713b (line–line angle)

2026-09-27 · Read-only findings and recommended follow-up, **not** a D-review decision or an approval. This audit uses the current canonical graph, source snapshots and mappings, image, and P-v2 profile. It does not derive a decision from either 10-goal D round. No canonical, mapping, registry, QA, or status file was changed by this audit.

## Finding and minimum goal wording

Canonical goal `18be713b-7d90-4f01-b60a-5582ac4df0e8` currently says “Schnittwinkel zwischen geometrischen Objekten berechnen” and describes an angle between “zwei sich schneidenden geometrischen Objekten”. This includes three distinct object pairs. The graph already has separate atomic goals `57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5` for **line–plane** (using a direction and a normal vector, with a complementary angle) and `bda6a659-9640-53a5-8be0-24705ab623ef` for **plane–plane**. The current wording therefore overlaps both. See `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json:64834`, `:64903`, `:77024`.

Minimum scope correction, retaining the ID, Q2/AB2 and GK/LK classification:

- `title`: **Schnittwinkel zweier Geraden berechnen**
- `description`: **Die lernende Person kann den kleineren Schnittwinkel zwischen zwei sich schneidenden Geraden berechnen und das Ergebnis geometrisch deuten.**
- `titleEn`: **Calculate the angle of intersection between two lines**
- `descriptionEn`: **The learner can calculate the smaller angle of intersection between two intersecting lines and interpret the result geometrically.**

“Sich schneidend” prevents a false claim that skew lines have a point of intersection; “kleinerer” fixes the convention independently of which direction vector is reversed. Checking whether the lines intersect belongs to the already separate line-position goal `69beb31d-5d02-4505-9500-3ec81af86f1e`; it need not be added as a second independent competence to this description.

The canonical `sourceRef` at `:64958` cites Hessen Q2.3, p. 42, bullets **3 and 8**. For the narrowed goal retain **bullet 3 only**. Bullet 8 is the source for the two sibling goals, not for line–line angles.

## Six current `requires` and the sole direct dependent

The six edges are in the canonical goal's `requires[]` at `:64915-64922`. Their contents were resolved against the current graph:

| Existing prerequisite | Current goal | Finding for line–line angle |
| --- | --- | --- |
| `9460c3ff-e72d-4107-bc73-087d217200aa` | Skalarprodukt als Orthogonalitätskriterium nutzen | Relevant special case (90°), but does not teach the general vector-angle relation. May remain; consider the more direct `265af6af-8eac-5632-b730-800aafcde26a` instead. |
| `fa02cf14-0411-4fe3-8be7-a62c69743e26` | Zwischen Koordinaten- und Normalenform von Ebenen wechseln | Plane-only; remove. |
| `36e0de23-1e3b-5c69-888f-e5e19e79cbbe` | Normalenform und Hessesche Normalenform einer Ebene anwenden (LK) | Plane-only **and LK-only**, while target is GK/LK; remove. |
| `d76766a5-ce07-5c7a-987b-157f2998b05e` | Zwischen Ebenenformen umformen | Plane-only; remove. |
| `ce491ec0-c558-5872-86fd-289e60a38403` | Punktprobe und Lage eines Punktes zur Ebene prüfen | Plane-only; remove. |
| `ea4bd128-17ab-5a8b-ae98-29552d774fb0` | Ebenengleichung aus geometrischen Bedingungen bestimmen | Plane-only; remove. |

Removing those five plane edges is necessary to make the prerequisite route match the narrowed scope and not gate a GK goal on an LK-only plane skill. A focused didactic route could use `265af6af-8eac-5632-b730-800aafcde26a` (“Skalarprodukt zur Winkelberechnung nutzen”, itself built on vector basics) and optionally `69beb31d-5d02-4505-9500-3ec81af86f1e` (“Lagebeziehungen von Geraden im Raum untersuchen”, built on parametric lines). These two additions are *recommendations*, not logically forced by the scope edit; whether intersection checking is a prior or is supplied in the task should be decided explicitly. Avoid retaining all old edges merely to preserve an inherited route.

Searching every canonical goal's `requires` found exactly one direct dependent: `2f8a3a90-717d-5ac1-b54e-facca26e9008`, “Geraden, Ebenen und Schnittfiguren analysieren”, at canonical `:72253`. It has `18be713b-…` both in `requires[]` and `examData.coveredGoalIds[]`. Its actual `examData.taskContent` asks for a point-on-line check, line–plane intersection, Hesse normal form, and a cuboid plane section; `examData.solutionContent` and `examData.scoring.steps[]` contain **no angle calculation**. Therefore remove `18be713b-…` from both exam arrays unless an angle task is actually added. Do **not** replace it there with `57b11e9a-…`: the exam does not assess a line–plane angle either. The exam also lists `bda6a659-…` without assessing a plane–plane angle; that is a companion coverage issue, not evidence to keep the 18be edge. There are no other direct dependents to migrate.

## Source mappings: preserve all three object pairs

| Jurisdiction | Evidence and present link | Required treatment after narrowing |
| --- | --- | --- |
| HE | Source-extraction Q2.3 bullet 3 aspect 2 says “Berechnen des Schnittpunktes und des Schnittwinkels zweier Geraden”; crosswalk maps source `he-math-sekii-q2-3-b03-a02-89c39f96` to `69beb31d-…` (`partial`) and `18be713b-…` (`exact`), at `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json:1121-1130`, decision `:4599-4610`. Bullet 8 “Gerade und Ebene sowie ... Ebene und Ebene” maps to the sibling goals at `:4725-4735`. | Keep the line–line mapping and ID. Correct only canonical `sourceRef` from bullets 3+8 to 3; do not move bullet 8 onto 18be. |
| BW | Granularized LK `bw-math-sekii-bp2016-3-4-2-03a-schnittwinkel-geraden` and GK `bw-math-sekii-bp2016-3-5-2-03a-schnittwinkel-geraden` each say “Schnittwinkel zwischen Geraden bestimmen” and map `partial` to 18be at `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_source_extraction_to_canonical_math.review.json:643-668`, `:1557-1580`, decisions `:4175-4193`, `:6024-6042`. The respective b/c aspects already map to 57b11/bda6. | Keep all three split links. Reassess, but do not automatically upgrade, the two a-aspect `partial` match types against the narrowed wording; no new BW mapping is needed. |
| HB | Legacy source `8e02917a-a5d9-46b9-b676-1fec1c7e7c10`, AG 5.3, explicitly covers angles **between lines, line and plane, and planes** (`curricula/DE/Gymnasium/input/HB/upper-secondary/source-json/DE_BRE_S_GYM_2_MATHEMATIK.de.json.snapshot:1573-1577`), but crosswalk has only a `partial` link to 18be (`curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_math_upper_secondary_to_canonical_math.json:218-222`). No HB mapping to either sibling exists. | Keep 18be as the line–line partial and add source-specific partial links from the same legacy ID to 57b11 and bda6; validate one-to-many mapping and derived source membership. Otherwise two explicit HB source aspects become unmapped by the new scope. |
| NW | GK/Q legacy source `61dd1254-898f-4b4b-9a5e-6ec20774138a` is broadly “Schnittwinkel zwischen geometrischen Objekten berechnen”, cited to KLP 2.4.1 (5), p. 25 (`curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_MATHEMATIK.de.json.snapshot:752-769`), yet its sole crosswalk entry to 18be is `exact` (`curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_math_upper_secondary_to_canonical_math.json:81-85`). A separate LK/Q source `8ddec0a9-d7e9-4eca-8473-588b63fc29d5` maps `exact` to 57b11 at `:121-125` and is LK-tagged (`...snapshot:985-1005`). | **Mandatory:** downgrade the broad GK source's 18be link from `exact` to `partial`. Check the normative GK wording and map its remaining line–plane/plane–plane aspects to 57b11/bda6 where supported, especially because the existing 57b11 legacy link is LK-only; do not count that LK link as GK coverage. Keep the pre-existing LK link separately. |

The current source snapshots/mappings are evidence for this scope audit, not a fresh normative-source approval. Any changed HB/NW crosswalk needs the usual source-membership/closure-registry regeneration and verification; this audit intentionally does not write those derived files.

## Image, P-v2, and targeted checks

The current PNG at `app/public/assets/goal-visualizations/mathematik/18be713b-7d90-4f01-b60a-5582ac4df0e8/18be713b-7d90-4f01-b60a-5582ac4df0e8.png` (SHA-256 `984456f9834149a31314167bc77a31b4ebdb1f9b4b896810ffb104427067bde2`) was inspected at original size. It depicts exactly two intersecting lines, `u=(1,0)`, `v=(1,1)`, `α=45°`, `cos α=1/√2`; the mathematics is correct for this **one positive-dot-product example**. It therefore fits the narrowed scope without changing its bytes. The canonical resource title at `:64966` is still broad and should follow the new title; the alt text already identifies the two lines accurately. The image alone does not show the absolute value/orientation-invariance needed for a general smaller line angle; test that in the P profile and learning task.

Current P-v2 record: `curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ten-independent-png-20260927-v1/positive-current-ten.review.jsonl:7`. It is `status: needs_human_review`, `reviewAuthority: ai_candidate`, E1/G1. Its essential understanding, variation axis and second application case explicitly switch from two lines to a **line–plane** angle (60°), which becomes out of scope. Replace the line–plane expectation/axis/case with a truly independent **line–line** transfer case while retaining `minimumIndependentDemonstrations: 2`, `freshVariationRequired: true`, `independentTransferRequired: true`. Example: two lines through a shifted common point with directions `(1,1,0)` and `(-1,0,-1)` have `u·v=-1`, `|u||v|=2`; the smaller unoriented intersection angle is `arccos(|-1|/2)=60°`, not 120°. This varies location, 3D components and vector orientation while remaining within the goal. Recalculate the profile/goal/review-input fingerprints and re-review P and D after the canonical edit; the existing AI candidate is no approval.

Targeted checks for an implementation owner:

1. Assert canonical 18be title/DE/EN description and `sourceRef` mention only line–line and HE bullet 3; assert its `requires` excludes the five plane IDs and does not force an LK-only prerequisite for GK.
2. Assert no sibling content is silently merged into 18be; assert HE/BW a/b/c source-goal coverage and HB/NW split/`matchType` semantics, including NW GK versus LK.
3. Traverse direct dependents and verify `2f8a3a90-…` has neither 18be in `requires[]` nor `examData.coveredGoalIds[]` without a corresponding line–line-angle task; separately flag bda6's analogous mismatch.
4. Confirm PNG hash stays unchanged if only copy/metadata is updated; verify canonical resource title/alt and P-v2 both match two-line scope and a reversed-direction transfer case. Recompute all affected hash-bound QA, description, P, and status inputs before any closure claim.
