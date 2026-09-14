# Lernzielvisualisierung: Sternradien aus HRD-Daten abschätzen

## SkillPilot-Ziel

- SkillPilot-ID: `6a73cacc-e86d-5248-a180-fd3da8454b0f`
- Titel: Sternradien aus HRD-Daten abschätzen
- Beschreibung: Die lernende Person kann aus Leuchtkraft und Oberflächentemperatur eines Sterns im Hertzsprung-Russell-Diagramm seinen Radius mit einem thermischen Strahlungsmodell abschätzen und erklären, wie beide Größen die Schätzung bestimmen.

## Generator

- Provider: image_gen
- Status: pilot
- Quellbild: `6a73cacc-e86d-5248-a180-fd3da8454b0f.png`
- Public Asset: `/assets/goal-visualizations/physik/6a73cacc-e86d-5248-a180-fd3da8454b0f/6a73cacc-e86d-5248-a180-fd3da8454b0f.png`

## Prompt

```text
# Tatsächlicher Generierungs- und Korrekturverlauf für Kandidat 02

Dieses neue Metadatadokument bewahrt zwei bereits abgeschlossene image_gen-Aufrufe. Es wurde nicht als ein zusammengefügter Prompt an den Provider gesendet und behauptet keinen neuen Generierungsaufruf. Die beiden nachfolgenden Prompttexte sind unverändert aus den archivierten tatsächlichen Eingaben übernommen.

Provider/Werkzeug: image_gen. Eine genaue Modellversion wurde vom Werkzeug nicht offengelegt.
Endkandidat: stellar-radius-candidate-02.png, 1672 × 941 Pixel, SHA-256 19b3c4abeca32042eba2d32309d8669a4a07464acbfa7e05da17d37c8dbe40b9.

## Schritt 1: ursprüngliche Generierung

Tatsächliche Eingabe: stellar-radius.prompt.de.md. Keine angehängten Bildreferenzen; vorhandene Physikbilder waren nur Grundlage der textuellen Stilbeschreibung.
Ergebnis: stellar-radius-candidate-01.png, SHA-256 3eb4d10a3e1ee77fa56c36f18b0e2d281bcf17a81ea09b62acad2829709d3300. Wegen eines gezeichneten Scheibenverhältnisses von ungefähr 1,70:1 fachlich abgelehnt und nicht importiert.

Vollständiger tatsächlicher Prompt:

Use case: scientific-educational
Asset type: German upper-secondary physics learning-goal illustration, landscape 16:9.
Primary request: Visualize how a star's radius can be estimated from luminosity and surface temperature read from a Hertzsprung–Russell diagram, using a thermal-radiation model. Exactly this single competence.
Style: approachable educational cartoon/hand-drawn infographic, pale powder-blue background, clean black outlines, warm yellow stellar disks, restrained blue accents, large legible German handwriting-like labels. Match an existing series of clear physics learning illustrations, with generous whitespace and no photorealistic space background.
Title (exact): "Sternradien aus HRD-Daten abschätzen".
Composition: a schematic HR diagram on the left, the thermal model in a compact white rounded box in the middle, a clear equal-temperature radius comparison on the right. Do not add mass, distance, evolutionary tracks, or age.
Left panel: label "HRD (schematisch)". Vertical axis "Leuchtkraft L", increasing upward, "gering" only at the bottom and "hoch" only at the top. Horizontal axis "Oberflächentemperatur T", with "heiß" at the left and "kühl" at the right. Temperature DECREASES to the right. Plot exactly two small equal-size yellow point markers A and B vertically aligned at one temperature T₀: A lower and B higher. Dashed horizontal guides show luminosities L₀ for A and 4L₀ for B; their shared vertical guide is labelled T₀. The HRD points are coordinate markers, not pictures of physical radii. No numerical tick scale or apparent-brightness axis.
Middle: exact labels "Thermisches Strahlungsmodell", "L = 4πR²σT⁴" and "R = √(L / (4πσT⁴))". Render fractions and the square-root scope unambiguously. A short label "L und T → Radius R". No extra decorative equations.
Right: heading "Gleiche Temperatur T₀". Two circular stellar disks, identical yellow color and surface style, individually labelled "A: L₀, R₀" and "B: 4L₀, 2R₀". The B disk radius AND diameter must be exactly twice A's; hence B's drawn disk area is four times A's. Draw each radius as a straight center-to-rim segment, never a diameter. Label the two segments "R₀" and "2R₀". Include exact caption "Vierfache Leuchtkraft → doppelter Radius". No faces, rays or glow that obscure the measured disk rims.
Bottom: one short contrasting consequence, exact text "Bei gleicher Leuchtkraft: höhere Temperatur → kleinerer Radius". Also include a small readable "Modellabschätzung" label.
Constraints: physically and mathematically correct German text and notation; no technical IDs, brands, watermarks, pupil data, irrelevant props, invented observation data, or worked assessment-task solutions. Do not claim the HRD itself is a spatial map. All margins and labels must remain visible and readable at reduced display size.

## Schritt 2: gezielte Korrektur

Tatsächliche Eingabe: stellar-radius-correction-02.prompt.de.md. Einzige angehängte Bildreferenz war Kandidat 01.
Ergebnis: stellar-radius-candidate-02.png mit obigem Endhash. Der Root und der unabhängige Agent /root/stellar_radius_visual_review haben diesen Endkandidaten visuell für den AI-Pilot akzeptiert. Das dokumentiert keine menschliche Freigabe.

Vollständiger tatsächlicher Korrekturprompt:

Use case: precise-object-edit
Input image: the provided stellar-radius infographic is the edit target.
Change only the size of the SMALL yellow disk A and its interior radius segment/label in the right panel. Keep its center at the same position. Make A's circle radius EXACTLY HALF the radius of the large disk B, so B has twice A's diameter and four times A's area. At the current 1672-by-941 image size the large B disk has approximately320pixels diameter, so A must have approximately160pixels diameter, not188pixels. Preserve both circular shapes with no perspective distortion. Adjust A's center-to-rim segment to its new rim and retain its label R₀. Keep the disk fill and edge style unchanged.
Preserve everything else pixel-for-pixel as far as possible: the entire left HR diagram, axes and markers, formulas and square-root scope, all German text and subscripts, the large B disk and its 2R₀ radius, background, panel layout and margins. Do not add labels or elements. The sole goal is to correct the mathematical size ratio of the two stellar disks.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
