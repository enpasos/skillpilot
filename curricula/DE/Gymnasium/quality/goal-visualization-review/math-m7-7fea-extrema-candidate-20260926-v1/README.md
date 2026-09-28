# Q4 Extremstellen parameterabhängig: PNG-Kandidat

Goal ID: `7feaaebd-cc8d-522b-8b3a-ea22675c65dd`
Date: 2026-09-26
Status: **v2 candidate only; V remains HOLD**. No canonical, public/backend, subject-QA, registry, D, or P binding was changed.

| File | Dimensions | SHA-256 | Purpose |
| --- | --- | --- | --- |
| [`candidate-v1.png`](candidate-v1.png) | 1672 × 941, opaque RGB | `d03ecb5ec4443474c3abacced18fc3b793b1c976c5c29d0a616f5497bc97494e` | Full-resolution replacement candidate |
| [`candidate-v1-360.png`](candidate-v1-360.png) | 360 × 203, RGB | `9531a7ce5326a34b85e6ff0d72ba7aaf2af1f5e6f849124b7005fc1df652f433` | Derived mobile-card inspection image only |
| [`candidate-v2.png`](candidate-v2.png) | 1672 × 941, opaque RGB | `b6febfc994fc347e2ed2c71543b5bca797a2059c7980f92d259eda367cd63920` | Targeted smudge-cleanup candidate |
| [`candidate-v2-360.png`](candidate-v2-360.png) | 360 × 203, RGB | `7cc53575f88f02dff34513c6fa33a31857101376a92c689e08a7ead42cbdf168` | Derived v2 mobile-card inspection image only |

The held original JPG has SHA-256 `088d33393f407e4b78f8a6a623abdedcc7c8384744667174ae9ab340b8fe47f8` and remains in [`math-m7-quality-holds-20260923-v1/assets/`](../math-m7-quality-holds-20260923-v1/assets/7feaaebd-cc8d-522b-8b3a-ea22675c65dd/7feaaebd-cc8d-522b-8b3a-ea22675c65dd.jpg). Its table correctly gave `T(2|-4)`, while the miniature graph placed that vertex on the x-axis and mislabeled it `2(-4)`; it is not reused. The replacement uses a different, simpler family so the graph and calculation can be checked together without numeric coordinate callouts.

## Provenance

- Provider/tool: built-in OpenAI/ChatGPT-Codex `image_gen.imagegen`, one new generation followed by one background-only edit. The tool did not expose the exact model version or seed.
- Exact prompts and edit-target digests: [`prompt-v1.md`](prompt-v1.md) and [`prompt-v2.md`](prompt-v2.md). No technical goal ID or private learner/class/session/chat data were sent in the prompts.
- The archived original and two neighbouring mathematics JPGs informed the defect and approachable blue/orange comic style. None was supplied to the generation call; only the tool-generated transparent first version was supplied to the edit call.
- Both 360-pixel derivatives were created with `ffmpeg -vf scale=360:-1:flags=lanczos` solely for inspection; the full-resolution PNGs are the source candidates.

## Pixel inspection and mathematical check

- v1 full pixels and 360-pixel derivative were visually inspected. The title and short labels remained readable at card width; the axes, both vertices, and the orange parameter arrow remained recognizable. An independent reviewer held v1 because a broad grey erased-object smudge in the lower centre card was still visible at 360 px.
- One targeted `image_gen.imagegen` edit produced v2. Full-resolution and 360-pixel views show a clean lower centre card with no remaining grey smudge. The displayed text, formulas, axes, curves, vertex locations, arrow, check mark, three card borders and layout remain visually the same. The generative edit changed raster pixels beyond the smudge, so exact pixel identity outside the cleaned region is **not** claimed.
- Shown family: `f_a(x)=(x-a)^2`. Hence `f'_a(x)=2(x-a)`, its zero is `x=a`, `f''_a(x)=2>0`, and `f_a(a)=0`; the displayed `T_a=(a|0)` is correct.
- In v2 the two drawn upward parabolas have the same apparent shape, and both vertices touch the shared x-axis. The rightward `a wächst` arrow matches the increasing position `x=a`. There are no numeric ticks or coordinates whose drawn placement could contradict the symbolic result.
- The visual provides one illustrative family, not independent evidence that a learner has mastered parameter-dependent extrema for other families or exceptional parameter cases.

This is the creator's v2 candidate inspection, not a second independent image decision or a hash-bound V approval. Before any activation, a separate reviewer must inspect the exact v2 PNG for mathematical correctness, legibility, style, accessibility alt text, and rights; then affected current goal/page/context/source and positive-evidence bindings require targeted checks. The old approval and the independent mathematical pass for v1 cannot transfer to the v2 hash.
