# Bildrekonstruktionsprompt: Entscheidungsregel oder Stichprobenumfang aus Gütefunktionsgraphen bestimmen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `ae3483e3-4712-56a1-a881-2e1f8a1a8df9`
- Titel: Entscheidungsregel oder Stichprobenumfang aus Gütefunktionsgraphen bestimmen (LK)
- Beschreibung: Die lernende Person kann für vorgegebene Kandidaten von Entscheidungsregeln oder Stichprobenumfängen eindeutig gekennzeichnete Graphen der Operationscharakteristik oder Gütefunktion auswerten, die jeweiligen Nichtverwerfungs- beziehungsweise Verwerfungswahrscheinlichkeiten mit vorgegebenen Anforderungen vergleichen und eine passende Entscheidungsregel oder einen geeigneten Stichprobenumfang auswählen und fachlich begründen.

## Generator

- Provider: ChatGPT/Codex imagegen (model/version not exposed)
- Quellbild: `ae3483e3-4712-56a1-a881-2e1f8a1a8df9.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Erzeuge eine breite, freundlich handgezeichnete aber mathematisch sorgfältige deutsche Statistik-Lernkarte. Titel „Zwei Gütefunktionen gegen p“. Links ein Koordinatensystem mit p von 0 bis 1 horizontal und G(p) von 0 bis 1 vertikal. G(p) meint die Verwerfungswahrscheinlichkeit P_p(X≥k). Genau zwei glatte monotone binomiale Gütefunktionskurven: A blau mit n=40 und Verwerfungsregel X≥13, B rot mit n=80 und X≥23. Für p=0,2 gilt A≈0,043 und B≈0,039, also liegt Rot dort knapp unter Blau. Für p=0,4 gilt A≈0,871 und B≈0,986, also liegt Rot dort über Blau. Die Kurven dürfen dazwischen kreuzen; keine globale Ordnungsbehauptung. Rechts groß und lesbar die beiden Regeln, beide Wertepaare und die Anforderungen G(0,2)≤0,05 und G(0,4)≥0,90. Abschluss „Nur B erfüllt beide.“ Farbzuordnung und Zahlen müssen exakt sein. Sparsame Deko, keine Personen, keine weiteren Werte. Alle Texte auch bei 360 px Gesamtbreite lesbar.
```
