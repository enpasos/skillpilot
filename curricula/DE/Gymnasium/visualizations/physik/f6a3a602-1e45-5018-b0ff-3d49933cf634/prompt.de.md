# Lernzielvisualisierung: Beugung am Einzelspalt berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `f6a3a602-1e45-5018-b0ff-3d49933cf634`
- Titel: Beugung am Einzelspalt berechnen
- Beschreibung: Die lernende Person kann die Fraunhofer-Intensitätsverteilung eines gleichmäßig beleuchteten Einzelspalts aus der Überlagerung seiner Elementarwellen modellieren, die Minima und die Breite des Zentralmaximums begründen und Nebenmaxima aus dem Modell mit angemessenen Näherungen lokalisieren.

## Generator

- Provider: SkillPilot code-native precision fallback after reviewed Nano Banana Pro defects
- Status: pilot
- Quellbild: `f6a3a602-1e45-5018-b0ff-3d49933cf634.png`
- Public Asset: `/assets/goal-visualizations/physik/f6a3a602-1e45-5018-b0ff-3d49933cf634/f6a3a602-1e45-5018-b0ff-3d49933cf634.png`

## Prompt

```text
# Reproduktion: vorhandenes Einzelspaltziel, vollständiges Fraunhofer-Modell

Repository-nativer, begründet zugelassener Präzisionsfallback nach dem konkret
abgelehnten Nano-Kandidaten. Kein neuer Bildgenerator-Aufruf und keine
menschliche Freigabe. Die alte Bildentscheidung bezog sich nicht auf diese
erweiterte Fassung; die endgültige V2-Datei wird neu rasterbasiert geprüft.

Editierbare Quelle:
`fallback-v2-existing-single-slit-model/single-slit.svg`.
Reproduktionsskript: `render-single-slit-model-v2.mjs`; Basis:
`render-fallbacks.mjs` und `fallback-v1/single-slit.svg`.

Die erhaltene korrekte Geometrie verwendet eine einzige Spaltöffnung, b als
Randabstand, genau einen Bezugspunkt O sowie konsistente Winkel-, Schirm- und
Zentralbreitenmaße. Die echte sinc²-Kurve hat eine lineare Intensitätsskala,
Nullstellen bei von null verschiedenen ganzen Ordnungen und das erste
Nebenmaximum bei u ≈ 1,4303 mit I/I₀ ≈ 0,0472. V2 ergänzt die sichtbare
Intensitätsgleichung und den Grenzwert bei u = 0; keine Reduktion des Ziels
auf Tabellenablesen. Bedingungen und Kleinwinkelnäherung bleiben getrennt.

Abgelehnter Nano-Versuch, SHA und konkrete falsche Skala/Geometrie:
`nano-independent-review-v1.json`, Fall `single-slit`.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
