# Lernzielvisualisierung: Widerstandswirkungen in Reihen- und Parallelschaltungen deuten

## SkillPilot-Ziel

- SkillPilot-ID: `8f833b36-4126-52db-b210-79fb0023c7d9`
- Titel: Widerstandswirkungen in Reihen- und Parallelschaltungen deuten
- Beschreibung: Die lernende Person kann bei konstanter Quellenspannung vorhersagen und begründen, wie das Hinzufügen, Entfernen oder Ändern eines Widerstands in einer Reihen- oder Parallelschaltung den Gesamtwiderstand und die Stromstärken beeinflusst, und die Vorhersage an einem Grenzfall prüfen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: erzeugt und hashgebunden KI-geprüft
- Quellbild: `8f833b36-4126-52db-b210-79fb0023c7d9.jpg`
- Public Asset: `/assets/goal-visualizations/physik/8f833b36-4126-52db-b210-79fb0023c7d9/8f833b36-4126-52db-b210-79fb0023c7d9.jpg`

## Prompt

```text
Nutze die beigefügte fachlich korrekte Referenz als bindendes Layout und erzeuge davon eine lockere handillustrierte Nano-Banana-Pro-Fassung. Verändere weder Schaltungstopologie noch Zahlen noch Labels.

Links „Reihenschaltung“ bei U = 6 V: vorher ein 3-Ω-Widerstand mit R_ges = 3 Ω und I = 2 A; danach zwei Widerstände R_1 = 3 Ω und R_2 = 3 Ω in Reihe mit R_ges = 6 Ω und I = 1 A. Aussage: „Widerstand hinzu → R_ges größer → Strom kleiner“.

Rechts „Parallelschaltung“ bei U = 6 V: vorher genau ein 6-Ω-Zweig mit R_ges = 6 Ω und I_ges = 1 A; danach genau zwei getrennte parallele Widerstandszweige, jeder exakt „R = 6 Ω“, mit R_ges = 3 Ω und I_ges = 2 A. Unter beiden Zweigen steht genau einmal „je Zweig: I = 1 A“. Keine kleinen Strompfeile. Rechts werden obere und untere Schiene nicht kurzgeschlossen. Aussage: „Zweig hinzu → R_ges kleiner → Gesamtstrom größer“.

Unten der Grenzfall „R → ∞ ⇒ I → 0“ und „offener Stromkreis“. Jedes Omega-Zeichen und jeder Index muss korrekt sein. Insbesondere kein „R Ω“, kein fehlender Zahlenwert, keine zusätzlichen Bauteile oder Pfeile. Wenn ein langer Titel fehleranfällig wäre, lasse ihn weg.
```

## Review-Notiz

Das erzeugte Rasterbild wurde in Originalauflösung fachlich und auf Lesbarkeit geprüft. Die KI-Freigabe ist im QA-Ledger an sha256:2ee338935d6ff22ae21928cb2c6bc88415ff3716c4d3e23742af6b4f11721fbc gebunden; eine menschliche Freigabe wurde nicht behauptet.
