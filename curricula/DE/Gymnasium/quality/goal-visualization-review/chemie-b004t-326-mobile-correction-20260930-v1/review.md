# Chemistry 326 mobile correction — candidate review, 2026-09-30

## Scope and provenance

- Goal: `326d45bf-9f77-57d5-a054-93e76b034dd5`, **Aggregatzustände und Übergänge deuten**.
- Current canonical DE: “Die lernende Person kann feste, flüssige und gasförmige Zustände anhand beobachtbarer Eigenschaften unterscheiden und Übergänge zwischen ihnen als Zustandsänderungen desselben Stoffes erklären.”
- Current canonical EN: “The learner can distinguish solid, liquid and gaseous states by observable properties and explain transitions between them as changes in the state of the same substance.”
- Edit input and active asset: `app/public/assets/goal-visualizations/chemie/326d45bf-9f77-57d5-a054-93e76b034dd5/326d45bf-9f77-57d5-a054-93e76b034dd5.jpg`; 2752 × 1536; SHA-256 `254e46accdc2ef4a9e53821502c3a14d24d1861b8c4f3268d95f7651ee9ca2f7`.
- Generation: built-in Codex/ChatGPT `image_gen`, one edit using that JPG as visual reference and edit target. Exact prompt: [generation-prompt.md](generation-prompt.md). Generated source: `/home/enpasos/.codex/generated_images/01a0f437-c7a8-7281-9052-3be550302b2a/exec-cdd8a7d3-0c0b-4c54-a71d-b97128137f8b.png`.
- Candidate: [candidate-326d45bf-9f77-57d5-a054-93e76b034dd5.png](candidate-326d45bf-9f77-57d5-a054-93e76b034dd5.png); 1448 × 1086 PNG; SHA-256 `28c7efb897e8baeffa23afb3807341180e70409dba2afa473d1566f1379f2190`.
- 360/680 pixel previews were downscaled from each image with Pillow Lanczos: [original active JPG at 360 px](historical-active-before-correction/active-360.png), [original active JPG at 680 px](historical-active-before-correction/active-680.png), [candidate at 360 px](candidate-360.png), [candidate at 680 px](candidate-680.png).

## Format decision and visual inspection

I inspected the active JPG at original size and 680/360 pixel widths. The friendly comic and identical blue-particle model work well. At 360 pixels, the four transition names in the narrow gaps between state boxes are too small to read comfortably.

The candidate uses **4:3 landscape**. The extra vertical room holds two full-width arrow rows below the state boxes, so the transition names can be larger without shrinking the model. At 360 pixels the four names are visibly readable; at 680 pixels they are clear. This addresses the observed mobile weakness while preserving the pale blue comic styling and three-state particle comparison. The source JPG remains byte-for-byte unchanged.

## Fachliche Prüfung des Kandidaten

- Text at original, 680 and 360 widths: `Aggregatzustände`, `fest`, `flüssig`, `gasförmig`, `Schmelzen`, `Verdampfen`, `Erstarren`, `Kondensieren`; all spellings and umlauts appear correct. There is no extra small text.
- Same blue particle appearance in all three boxes signals one unchanged substance. The solid particles are close and regular, the liquid particles close and disordered, and the gas particles far apart. Motion marks occur in liquid and gas.
- Red arrows point from solid to liquid (`Schmelzen`) and liquid to gas (`Verdampfen`); the sun marks warming. Blue arrows point from gas to liquid (`Kondensieren`) and liquid to solid (`Erstarren`); the snowflake marks cooling. No chemical reaction or extra transition is depicted.
- Own visual and subject check: **candidate suitable for independent QA**. This is not an independent reviewer decision or V approval. The active asset, canonical goal, registry and visualization QA were not changed.

## Current active preview after integration

After the independently reviewed PNG became active, [active-360.png](active-360.png) and [active-680.png](active-680.png) were refreshed from the byte-identical candidate PNG. The two previews of the former JPG remain unchanged under `historical-active-before-correction/`. The candidate-stage statements above describe the earlier review point; the later binding decision is recorded in [active-integration.json](active-integration.json).
