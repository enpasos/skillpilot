# Physik goal visualization review – Batch 087

Review date: 2026-08-29

Scope: second user-reported correction of the electromagnetic-wave panel for
`ba16948b-5e07-54af-b77b-776e677c6906`. The correction is Layer-A curriculum
data and does not alter the frozen OpenAI Coach V1 contract.

| Candidate | Decision | SHA-256 | Original-resolution finding |
| --- | --- | --- | --- |
| Previous checkpoint asset | `rejected_after_product_owner_review` | `sha256:02669013ecdfd48a07a4ff96364a01cabc6c2f7456050628f217ff641c991998` | The third B bundle remained longitudinally ambiguous and visually merged with its neighbor. |
| Nano Banana retry 1 | `rejected_missing_half_wave` | `sha256:93eb49271ef7c0b91c48605cf910cbb10d275fb0c67a1a8bdc7be7dd4b1c617f` | The edit moved the affected lobe too far toward +k and effectively removed the fourth B interval. |
| Nano Banana retry 2 | `rejected_residual_overlap` | `sha256:04d1536ddb780cc4005021ca40c7a3c8c3e06c586c3793839346ca2cb65a0a08` | The middle blue lobes remained merged rather than forming four legible intervals. |
| Precise generative edit | `rejected_whole_image_drift_and_three_b_lobes` | `sha256:5a298b59fa8dee3347bcd42febaf1375359d73cca03c7b29a037cda275bcca7a` | It redesigned the image and still showed only three blue lobes. It was never imported. |
| Controlled SVG-overlay candidate | `accepted_by_product_owner_for_checkpoint` | `sha256:db637dbe6ca80ebc329d60ed64da7db656bb686ef275357632b6afbb8001c08a` | Five shared zero crossings delimit exactly four E and B half-wave intervals. B3 is bound to Z2–Z3 and ends on k before B4. Independent physics review passed. |

The accepted geometry source is
`curricula/DE/Gymnasium/visualizations/physik/ba16948b-5e07-54af-b77b-776e677c6906/em-wave-geometry-correction-v2.svg`
with SHA-256
`a1edfac50ea5acd7e88b214ae0b5f949613de0f0cecbeec77556300237babfc3`.

The visual review confirmed exact and legible German labels, intact comparison
box and detectors, and no residue of the old false oval. It also recorded a
visible local patch seam and a somewhat smoother corrected-wave style. These
imperfections are not hidden: after seeing the exact candidate, the Product
Owner stated that it was “nicht perfekt aber hinreichend gut” and requested the
checkpoint to be finalized quickly. The QA ledger therefore records real human
approval for this exact hash, not an inferred approval. Nano Banana Pro remains
the base illustration; the repository-native overlay was used only after the
reference-driven provider attempts failed the required geometry.
