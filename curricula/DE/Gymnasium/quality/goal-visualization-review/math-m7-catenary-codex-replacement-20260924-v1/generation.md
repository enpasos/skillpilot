# Kettenlinie: PNG-Erzeugung und tatsächliche Prompts

- Ziel: `164921f6-3bf7-5efc-a438-ea4759dca9ef` — Kettenlinien als Funktionsmodelle untersuchen (LK)
- Anbieter/Werkzeug: OpenAI, ChatGPT/Codex `image_gen.imagegen`; ein genauer Modellname wurde vom Werkzeug nicht ausgewiesen.
- Strategie: Zuerst ein quadratisches PNG ohne Bildreferenz generiert; nach Prüfung der tatsächlichen Pixel gezielte Bearbeitung dieses PNGs als Bildreferenz mit demselben Werkzeug. Keine privaten Lernenden- oder Sitzungsdaten verwendet. Die technische Ziel-ID stand nicht in den Anbieter-Prompts.
- Erster Kandidat: `sha256:47811b04e187314424280d4fab4a9785e492b125d01fae62c7f6eb5284ea5b1d` (HOLD: `a>0` und die beiden benannten Vergleichs-Tiefpunkte fehlten).
- Korrigierter Kandidat: `candidate.png`, `sha256:8d99974b42884e6b7eee4193f37afc5e6df9baf599ee15839e9f9046784bd0c8`. **Nicht aktiv gebunden.** Ein lokaler Testimport wurde nach einem neu erkannten LK/GK-Geltungswiderspruch zurückgenommen; die gebundenen historischen D-/P-Nachweise bleiben so gültig.
- Der erste Kandidat bleibt nur als Erzeugungsreferenz im temporären Codex-Bildverzeichnis; das historische, zuvor wegen „Katenoide“ zurückgestellte Nutzerbild bleibt unverändert im Review-Archiv.

## Tatsächlicher erster Prompt

```text
Use case: scientific-educational
Asset type: square PNG learning-goal illustration for German upper-secondary mathematics, readable on a phone
Primary request: show a real hanging chain forming a catenary and connect it to a function graph, with the correct name Kettenlinie.
Scene/backdrop: warm, lightly textured classroom-notebook atmosphere, uncluttered.
Subject: on the left, a friendly hand-drawn comic-style metal chain hanging freely between two supports at equal height, lowest point centered. On the right, a clearly separate coordinate graph of one symmetric catenary with its lowest point precisely on the vertical axis at (0,a+c). A small secondary inset compares a=1 and a=2 on their own aligned coordinate axes with the same c: the a=2 curve is flatter near its minimum and its minimum is higher. Do not imply that both curves pass through the same fixed supports.
Style/medium: friendly, abstract, clear educational comic illustration with clean smooth lines, gentle pastel color, no photographic realism, no sterile engineering-chart look. Mathematics remains precise.
Composition/framing: square, large subjects and very few labels, generous whitespace, readable at 360 px width.
Text (verbatim): "Kettenlinie", "y = a·cosh(x/a)+c", "(0,a+c)", "a=1", "a=2". No other prose or labels.
Constraints: Spell Kettenlinie exactly; never write Katenoide. Curves must be U-shaped and symmetric about x=0. The graph's minimum must be at x=0, not at the origin unless a+c=0. The a=2 curve must be visibly flatter near its own minimum and have its own higher minimum than a=1 when c is fixed. No false coordinates, no extra formulas, no watermark, no technical IDs.
```

## Tatsächlicher Bearbeitungs-Prompt

Referenzbild: der unmittelbar zuvor erzeugte erste Kandidat mit obigem SHA-256. Die Bilddatei wurde als `referenced_image_paths` an dasselbe Werkzeug übergeben.

```text
Edit the supplied square German mathematics learning-goal comic. Preserve its warm, friendly, clear comic style; hanging chain, Kettenlinie heading, correct symmetric main plot, and the existing catenary formula. This is a targeted mathematical annotation correction, not a stylistic redesign. Make room by reducing the decorative books/plant/notebook in the lower-left if needed, and enlarge the lower comparison inset. Add exactly these missing labels in large, legible hand-lettering: `a > 0` immediately by the main formula; `(0,1+c)` directly beside the lower red minimum point of the a=1 curve; `(0,2+c)` directly beside the higher green minimum point of the a=2 curve. Keep `a=1` red and `a=2` green clearly associated. Ensure on aligned lower-inset axes that the green a=2 curve is flatter near its own minimum and has a higher minimum than the red a=1 curve with fixed c. Mathematical text must be EXACT: `Kettenlinie`, `y = a·cosh(x/a)+c`, `a > 0`, `(0,a+c)`, `a=1`, `a=2`, `(0,1+c)`, `(0,2+c)`. Do not insert any other mathematical symbols or labels. No `Katenoide`, no wrong coordinates, no invented common support intersections, no watermark. Readability at 360-pixel width is required. Original aspect ratio square PNG.
```

## Abnahmegrenze

Die unabhängige Prüfung der korrigierten Originalpixel fand Kette, Symmetrie, Formel, `a>0`, Tiefpunkt `(0,a+c)` sowie beide getrennten Vergleichstiefpunkte fachlich und visuell stimmig. Dies ist eine KI-seitige Bildprüfung, keine menschliche Freigabe und kein Nachweis von Lernleistung. **V bleibt bis zum erneuten Import und einer hashgebundenen QA-Entscheidung offen.** Vorher ist der belegte HE-GK/LK-Geltungsfehler aus dem [D-Diagnosepaket](../../goal-description-review/mathematik/rollout-v1/2026-09-24/m7-catenary-codex-image-current-20260924-v1/scope-hold.md) zu beheben. Der Import würde außerdem die aktuelle GoalBook-Seite ändern und dadurch die bestehende D-Resolution und P-Profilbindung veralten lassen. Beide müssen vor einem strengen M7-Abschluss gezielt auf aktueller Ziel-, Seiten- und Kontextbasis neu geprüft werden; bis dahin bleibt das Bild ein Kandidat und der bisherige M7-Stand unverändert.
