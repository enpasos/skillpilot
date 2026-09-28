# J5 Parallelität und Senkrechtlage: PNG-Kandidat

Goal ID: `2231c29b-eb4e-51ae-9cb1-eb033bf16099`
Status: **candidate only**; not active, not a V approval, not a human release review.

The existing 2026-09-24 hold in [`mathematik-2231-right-angle-hold-20260924-v1.md`](../mathematik-2231-right-angle-hold-20260924-v1.md) identified two line pairs marked as perpendicular even though their intersections measured roughly 79° and 85°. The held JPG remains unchanged. This package contains one targeted OpenAI/ChatGPT-Codex `image_gen.imagegen` edit of that archived original; the tool did not expose an exact model version.

| File | Dimensions | SHA-256 | Purpose |
| --- | --- | --- | --- |
| [`candidate-v1.png`](candidate-v1.png) | 1678 × 937 | `e8f588db1a49bdfcb15a1e72b2968a86990da1fb08d3e326d7f826f5a4794589` | First edit, rejected: lower angle ≈ 88.0° |
| [`candidate-v1-360.png`](candidate-v1-360.png) | 360 × 201 | derived from v1 | Mobile-card inspection only |
| [`candidate-v2.png`](candidate-v2.png) | 1678 × 937 | `b607afbb1959b917e840aa8a6c0109987b06b08f1162924cfa77b302243083c3` | Targeted correction, still held: lower angle ≈ 89.0° |
| [`candidate-v2-360.png`](candidate-v2-360.png) | 360 × 201 | derived from v2 | Mobile-card inspection only |

Input to v1: [`2231c29b...jpg`](../mathematik-2231-right-angle-hold-20260924-v1/assets/2231c29b-eb4e-51ae-9cb1-eb033bf16099/2231c29b-eb4e-51ae-9cb1-eb033bf16099.jpg), SHA-256 `ec06d27bbc0cbac5f4ea895d48d353186481de26cfa840b4408c6ced387bab94`. Input to v2: `candidate-v1.png`. The exact provider prompts are in [`prompt-v1.md`](prompt-v1.md) and [`prompt-v2.md`](prompt-v2.md). No private learner, class, session, or chat data were used in the prompts; no technical goal ID was sent to the provider.

Pixel inspection: The top-right pair is horizontal/vertical and thus visibly perpendicular. The lower-right diagonals look right-angled by eye, but a blue-stroke regression on four disjoint straight-line regions estimates slopes `k≈+1.002`, `l≈−0.932` for v1 and `k≈+0.997`, `l≈−0.970` for v2; the corresponding acute crossing angles are approximately **88.0°** and **89.0°**, respectively. This is a marked improvement from the held original's approximately 79°/85°, but v2 does not prove an exact 90° intersection despite the orange corner mark. The two left pairs remain parallel with dashed common-perpendicular distances. At 360 px the geometry and section labels remain recognizable, but the long heading is small.

**Decision: HOLD.** Neither generated candidate is imported or approved for V. Since the image explicitly asserts perpendicularity, a subsequent correction must make the actual crossing demonstrably right-angled. Another machine reviewer must also inspect the resulting pixels and current goal; generating the image and calculating a hash do not constitute approval.

Next steps if independently accepted: import as canonical PNG and synchronized public/backend copies; write new image provenance/alt text and hash-bound V decision; perform targeted current goal/page/context/source and positive-evidence checks for D/P. An image hash refresh alone cannot establish any of these gates. Existing valid evidence for unchanged goals stays untouched.
