# Prediction-interval candidate v3

Tool: built-in OpenAI/Codex `image_gen.imagegen` (model version not exposed).
Input: `candidate-v2.png`, whose translucent/noisy background was rejected by independent inspection on a dark surface.
Output: `candidate-v3.png`, SHA-256 `03d3076175b836975fb9739553fd8628154895322fbfd521ec899c8533edd5df`.
Generator original: `/home/enpasos/.codex/generated_images/01a03a32-5c3d-7122-a394-13d4f26b0054/exec-b7f344b0-c554-44b5-8120-da306cb25b1e.png`.

Actual edit prompt:

> Edit the supplied image minimally. Preserve exactly the visible instructional diagram, all text, figures, positions, line weights, colors, and friendly abstract comic style: known p and fixed n, future sample X/n, prediction interval, three future outcomes inside and one outside. The only intended correction is a fully opaque clean cream/white background everywhere, including all corners, with no transparency, speckling, dark noise, bleed-through, or blotches when displayed on a dark page. Render as an opaque PNG. Do not add or remove any teaching content, text, decorative elements, branding, or watermarks.

Technical first check: PNG is 1536×1024 RGB without an alpha channel. Mathematical and mobile QA remains a separate decision.
