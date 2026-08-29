# Physik goal visualization review – Batch 086

Review date: 2026-08-29

Scope: user-reported correction of the third magnetic-field half-wave in the
electromagnetic-wave panel for `ba16948b-5e07-54af-b77b-776e677c6906`. Nano Banana Pro remained the
preferred provider; no repository-native replacement was accepted.

| Candidate | Decision | SHA-256 | Original-resolution finding |
|---|---|---|---|
| Previous published asset | `rejected_user_reported_phase_shift` | `sha256:a7d2a21bc5759fc91734127529c2502c0df9f316a35667d6d4a441989b56b143` | The third negative B half-wave is displaced by one half wavelength in +k and overlaps the fourth positive half-wave, creating a false closed oval. |
| Nano Banana attempt 1 | `rejected_additional_label_drift` | `sha256:b51b23bf984be5e243c0b9579ac5a903af98d25bfbb5c7d68ad62fd3f4f95819` | The wave is substantially improved, but the second B label moves unnecessarily and the correction is less local. |
| Nano Banana attempt 2 | `accepted_pilot_after_user_reported_correction_and_independent_review` | `sha256:02669013ecdfd48a07a4ff96364a01cabc6c2f7456050628f217ff641c991998` | The third negative and fourth positive B half-waves occupy consecutive phase intervals and remain separate. Their longitudinal zero crossings lie on k; their lateral tips correctly remain transverse amplitude maxima. Every German label, the E wave, both panels, sources, detectors, and the loose style remain intact. |
| Nano Banana attempt 3 | `rejected_text_corruption` | `sha256:c9829ed234ecec3d501ae27bb4c78ba0e428a5cdd1179d4f4e945c14c35e3c89` | The source label `beschleunigte Ladungen` is visibly damaged. |
| Nano Banana attempt 4 | `rejected_residual_overlap` | `sha256:2241080c36af07617f7834a0ceed7c1aec767933b8c8096707462bdc9072e467` | The third and fourth B half-waves still overlap longitudinally; the oval defect is not cleanly resolved. |
| OpenAI full redraw attempt | `rejected_whole_image_drift` | n/a | The result redesigned the complete infographic and text instead of making the requested local correction. It was not imported or used. |

The accepted file is the independently reviewed Nano Banana Pro candidate. The
three deployed copies are byte-identical. The prior prompt is retained verbatim
as `prompt.nano-banana-pre-correction.de.md`; the active prompt documents the
accepted phase correction and explicitly avoids the earlier mistaken endpoint
interpretation. Human approval is not fabricated: the QA ledger remains
`humanApproved: no`.
