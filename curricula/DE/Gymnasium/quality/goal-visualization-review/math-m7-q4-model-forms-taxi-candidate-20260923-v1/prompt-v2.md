# Candidate v2: exact image-edit prompt and provenance

- Date: 2026-09-23
- Edit target: `candidate-v1.png`, SHA-256 `234b2a43b6cbfe7cac257f5d1f574c04a123f2ca49591f2cc53da26d46f0c095`.
- Tool: OpenAI/Codex built-in `image_gen` edit mode. The tool did not expose a more specific model identifier; none is inferred.
- Input mechanism: local edit-target path supplied as `referenced_image_paths`; no other image input.
- Output from tool: `/home/enpasos/.codex/generated_images/01a0cc36-f58a-74c2-82b4-8dc8dfb3489a/exec-6ecf0c40-8a97-4101-a706-8caf907af930.png`.
- Archived workspace copy: `candidate-v2.png`, 1679 × 937 PNG, SHA-256 `5e2384b38407263b6330b8f538d200355923523508db757465cef95360349fdb`.

## Exact prompt sent to the image tool

```text
Use case: precise-object-edit / scientific-educational. Asset type: wide raster illustration for a German mathematics learning-goal card. Image 1 is the EDIT TARGET, not merely a style reference. Edit the pictured friendly abstract comic taxi visual as locally as possible. Main correction: the three sticky-note cards must NOT form a numbered left-to-right sequence. Keep the yellow fare-function card labelled exactly 'Funktion' with the exact formula 'K(x)=4+2x' and line 'Fahrpreis für x km (in €)'. From this function card, make TWO separate, equally weighted orange arrow branches: one arrow directly to a distinct blue card labelled 'Gleichung' with exact formula 'K(x)=20' and exact line 'genau 20 €'; a separate arrow directly to a distinct peach card labelled 'Ungleichung' with exact formula 'K(x)≤20' and exact line 'höchstens 20 €'. Arrange the two condition cards as alternatives, for example upper-right and lower-right. There must be NO arrow between the Gleichung and Ungleichung cards and NO 1, 2, 3 numbering or step badges anywhere. The visual meaning is: for the SAME fare function, two different real-world questions, exactly 20 € OR at most 20 €, choose different conditions; neither condition transforms into the other. Preserve the title exactly 'Beziehungen mathematisch modellieren', the friendly cartoon student and taxi, pale-blue/orange palette, clear wide composition, and the small legend exactly '4 € Grundpreis' and '2 €/km Streckenpreis'. The values and units must remain mathematically correct: x is distance in km, 4 € is fixed base fare, 2 €/km is distance rate, K(x) is total fare in euros. Do not label 2x as total fare. Maintain large, legible German labels and formulas at small card display size. Avoid extra equations, wrong symbols, technical IDs, watermark, photo style, or new mathematical content. Output a polished PNG candidate, not a solution task.
```

## Generator-side visual self-check; independent approval pending

The produced image visibly has two orange arrows leaving the fare-function card, one to `K(x)=20` and one to `K(x)≤20`. No arrow joins the two condition cards, and the numbered badges are gone. Visible symbols and labels appear correct: `K(x)=4+2x`, `genau 20 €`, `höchstens 20 €`, `4 € Grundpreis`, `2 €/km Streckenpreis`. The friendly taxi/student setting and palette remain. This is a generator-side check of the generated pixels, **not** an independent image review, QA approval, import, or M7/V decision. Cockpit card-width rendering and all release gates remain to be checked separately.
