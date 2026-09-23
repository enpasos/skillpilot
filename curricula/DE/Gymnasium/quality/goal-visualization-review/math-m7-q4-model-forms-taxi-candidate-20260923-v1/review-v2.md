# Independent visual review — taxi model forms, candidate v2

- Date: 2026-09-23
- Goal: `07196e72-ba47-54bf-a096-3a79bbb67e23`
- Decision for `candidate-v2.png`: **KEEP as the corrected image candidate**. The v1 visual defect is resolved in these pixels. This is a candidate-level visual and mathematical decision, not an import, active QA/V binding, human approval, M7 claim, or release approval.
- Candidate SHA-256: `5e2384b38407263b6330b8f538d200355923523508db757465cef95360349fdb` (1679 × 937 PNG).
- Rejected v1 SHA-256: `234b2a43b6cbfe7cac257f5d1f574c04a123f2ca49591f2cc53da26d46f0c095` (1679 × 937 PNG).
- Currently active source JPG SHA-256: `ee466836b3cc63ac91d50cfa85d479bf0dc2c4b84451916a787ddd47868cc825` (2752 × 1536 JPEG).
- Review basis: actual v2, v1, and active JPG pixels viewed at original resolution; current canonical German and English goal fields; `prompt.md`, `prompt-v2.md`, and the source-image prompt metadata; `AGENTS.md` §7.3 and `docs/concept/skill-graph/atomic-goal-visualizations.md` quality and hard-review rules. The v2 edit used OpenAI/Codex built-in `image_gen` with v1 as its sole image input; the tool exposed no narrower model identifier.

## Image findings

The yellow function card says `K(x)=4+2x` and `Fahrpreis für x km (in €)`. The legend gives `4 € Grundpreis` and `2 €/km Streckenpreis`. With `x` measured in km, the distance-dependent term is `2x` euros and `K(x)` is the whole fare. The image does not repeat the active JPG's misleading `p·x: Fahrtkosten` label for the whole fare. The blue card pairs `K(x)=20` with `genau 20 €`; the peach card pairs `K(x)≤20` with `höchstens 20 €`. The values, units, equality, and inequality direction are consistent. No solution for `x` is asserted or needed in this orientation image.

Two distinct orange arrows now leave the function card: one reaches the equality card and one reaches the inequality card. There is no arrow between those two condition cards and no `1 → 2 → 3` numbering. The layout therefore presents two different questions about the same fare model; it no longer portrays the equality as a step toward, or as equivalent to, the inequality. These conditions overlap mathematically at exactly 20 €, but the drawing makes no claim that their solution sets are disjoint.

At original resolution, the formulas, comparison sign, card labels, `genau`/`höchstens`, and price legend are sharp and unobstructed. The friendly taxi/student comic, pale-blue/orange colors, and restrained mathematical content fit the existing source-image style. `TAXI` is a generic context label; no visible technical ID, watermark, copied worksheet, protected character, or malformed text appears. This is a visual observation, not a separate rights determination. The long heading and peripheral speech/sign text add density and may become small on a narrow cockpit card; actual card-width and MCP widget rendering have not been measured and remain integration checks before release.

## Separate goal-title issue and remaining gates

The canonical German title is `Beziehungen als Modellgleichungen aufstellen` and the English title is `Set up model equations`. Their descriptions already claim formulating relationships as **equations, functions or inequalities** and justifying the model choice. The image heading `Beziehungen mathematisch modellieren` is broader than those titles but remains within the descriptions. This pre-existing DE/EN title-scope mismatch requires its own authoring decision and targeted evidence checks; the image KEEP decision does not resolve it. The image illustrates a model choice and does not claim to teach a full justification or prove mastery.

Before activation, check the actual cockpit card width and host image renderer, provide specific alt text and valid license/attribution metadata, and recheck affected goal/page/context and D/P/A/M/V evidence after any substantive title or image change. The current JPG and its historical human/AI review entries remain in place, even though its `p·x` label merits separate adjudication. This review changed only this versioned review file; it did not import v2 or edit canonical goals, assets, QA records, registry data, mappings, or public copies.
