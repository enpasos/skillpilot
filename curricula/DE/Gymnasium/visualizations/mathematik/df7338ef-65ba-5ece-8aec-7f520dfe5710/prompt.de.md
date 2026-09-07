# Lernzielvisualisierung: Logistisches Wachstum untersuchen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `df7338ef-65ba-5ece-8aec-7f520dfe5710`
- Titel: Logistisches Wachstum untersuchen (LK)
- Beschreibung: Die lernende Person kann logistisches Wachstum anhand geeigneter Funktionen beschreiben, modellieren und die Unterschiede zu begrenztem bzw. einfachem exponentiellem Wachstum (Sättigung/Tragfähigkeit) herausarbeiten.

## Generator

- Provider: Repository-native SVG / Playwright Chromium (reviewed Nano fallback)
- Status: ai-reviewed
- Quellbild: `df7338ef-65ba-5ece-8aec-7f520dfe5710.png`
- Public Asset: `/assets/goal-visualizations/mathematik/df7338ef-65ba-5ece-8aec-7f520dfe5710/df7338ef-65ba-5ece-8aec-7f520dfe5710.png`

## Prompt

```text
# Deterministische mathematische Konstruktion – keine Nano-Generierung

Dies dokumentiert die tatsächlich umgesetzte native Ersatzkonstruktion.
Die beiden realen Nano-Versuche, ihre Prompts und Ablehnungen bleiben im Archiv.
Es werden keine Nano-Pixel nachbearbeitet oder als erfolgreiche Nano-Korrektur ausgegeben.

render-df7338ef-fallback.mjs zeichnet N(t)=1000/(1+9 exp(−0,6t)) für
0≤t≤10 aus1001 berechneten Punkten auf linearen Achsen:
px=110+74t, py=575−0,33N. Startwert100, Tragfähigkeit1000 und der
Wendepunkt bei N=500, t=ln(9)/0,6≈3,662 müssen zu diesen Achsen passen.
Die Differentialgleichung N′=0,6N(1−N/1000) erklärt das Maximum des
absoluten Zuwachses150 je Modellzeiteinheit bei N=500.
E(t)=100exp(0,6t) und B(t)=1000−900exp(−0,6t) werden textlich
gegenübergestellt: E wird steiler und ist unbeschränkt, B wird flacher und
hat keinen Wendepunkt. Die S-Form gehört zum dargestellten logistischen
Anfangswert unter K/2, nicht beliebigen Anfangswerten.
Der im Repository fixierte Playwright Chromium rendert das SVG als1600×900-PNG.

Notwendigkeit der Ausnahme: Beide gezielten Nano-Korrekturen setzten N(0)=100
weiterhin an eine falsche Position der ausdrücklich linearen y-Achse; der
zweite Versuch ergänzte widersprüchliche Teilstriche. Das native SVG wurde
am tatsächlichen Raster zweifach geprüft und sämtliche1001 Kurvenpunkte
unabhängig nachgerechnet. Keine allgemeine Provideränderung und keine menschliche Freigabe.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
