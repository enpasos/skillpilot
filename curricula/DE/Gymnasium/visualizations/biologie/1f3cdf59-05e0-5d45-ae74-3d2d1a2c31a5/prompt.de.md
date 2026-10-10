# Tatsächliche Bildgenerierung und aktuelle maschinelle Sichtprüfung

Eigenes didaktisches Material: CC-BY-4.0. Technische Dokumentation: Apache-2.0.

Lernziel: 1f3cdf59-05e0-5d45-ae74-3d2d1a2c31a5

## Ursprünglicher tatsächlich verwendeter Prompt

Use case: scientific-educational. Create one original PNG educational illustration for a German secondary-school biology learning goal. Friendly, abstract, clear comic-style school illustration, pastel blue/violet/green/warm orange, soft cream background, clean wide landscape about 16:9 at nearest native high resolution to 1600x900. Main motif and only a few very large short German labels must remain understandable at 360px and 680px wide. No photorealism, no sterile technical style, no title, watermark, tiny text, complex text or task data. Scientific accuracy matters more than decoration. Blood glucose regulation by insulin and glucagon as a clear comic TWO-ROW feedback schematic. Top row: a small blood vessel with MANY glucose dots, a pancreas releasing INSULIN, then liver plus muscle taking up/storing glucose, ending at a blood vessel with FEWER dots. Bottom row: a blood vessel with FEW glucose dots, pancreas releasing GLUCAGON, then ONLY liver releasing glucose into blood, ending at MORE dots. Labels ONLY 'Insulin: senkt', 'Glucagon: erhöht', 'Leber', 'Muskel'. Draw arrows directionally correct: glucose into liver/muscle above and glucose OUT OF LIVER into blood below. Glucagon must NOT make muscle export glucose; insulin is a signal, not a glucose carrier. Use simple friendly stylized pancreas, liver, muscle icons; correct liver anatomy not heart. No medical dosing, diagnostic numbers, personal blame, excessive label text. Keep all main panels spacious and readable at phone width.

## Tatsächlicher Korrekturprompt v2

Correct scientific arrow meaning in this friendly two-row blood-glucose regulation diagram; preserve palette, wide comic PNG and large labels. Redesign as TWO simple three-element rows: small PANCREAS at LEFT, organs in MIDDLE, BLOOD VESSEL at RIGHT. TOP: label 'Insulin: senkt', GREEN dashed hormone-signal arrow pancreas→liver and muscle; separate BLUE glucose arrows originate in the RIGHT blood vessel and point LEFT into liver and muscle. Glucose hexagons shown moving FROM blood INTO tissues; no arrow from muscle back to blood and no glucose through pancreas. BOTTOM: 'Glucagon: erhöht', PURPLE dashed hormone signal pancreas→LIVER ONLY; separate BLUE glucose arrows originate in liver and point RIGHT INTO blood. NO muscle in bottom row. Labels only existing 'Insulin: senkt', 'Glucagon: erhöht', 'Leber', 'Muskel'. Do NOT draw blue glucose-flow arrows into/out of pancreas. Hormones are signals, glucose moves between blood and tissues. A few large hexagons, large spacious motifs readable360px; no medical values, no new fine print.

## Herkunft und Entscheidung

Generator: OpenAI builtin imagegen. Original-PNG: sha256:9b2793683a3c2821b6125a70f3d69bcdaab6c6c0c56506a8fba60a4e10abde2d. Maße: 1672 × 941; nahe natives 16:9. Tatsächlicher Herkunftsnachweis: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-whole-material-and-raster-author-candidate-v1/prompts/six.v2.actual-imagegen-edit-provenance.json.

Aktuelle Entscheidung: KEEP nach zwei tatsächlichen unabhängigen maschinellen Prüfungen von Original, proportionalen 360-/680-Pixel-Sichten und vollständiger nativer HTML-/PDF-Lernzielseite. A: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-current-v3-independent-a-20261010-v2/current-native-ten-independent.A.json; B: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-current-v3-independent-b-20261010-v1/whole-ten-independent-DPAMV-review.json.

KEEP: Insulin signalisiert oben getrennt vom Glucosefluss an Leber und Muskel; unten signalisiert Glukagon an die Leber, von dort geht Glucose ins Blut. Muskel wird nicht als Glukagon-vermittelter Blutexportraum dargestellt. Pfeilrichtungen und Farbrouten bleiben bei 360 nachvollziehbar.

Die proportionalen Sichten dienen der lokalen Lesbarkeitsprüfung; sie sind keine ausgelieferten Ersatzbilder und keine Erprobung auf einem echten Handy. Erzeugung allein war keine Freigabe. Keine menschliche Freigabe oder Erprobung behauptet.
