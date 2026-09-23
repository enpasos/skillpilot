# Unabhängige Kandidatenprüfung: Zentrische Streckungen am Koordinatenursprung mit Matrizen darstellen

Datum: 21.09.2026, 21:48:35 UTC. Entscheidung: **KEEP**, Status `candidate`, Autorität `ai_candidate`. Keine Human-Freigabe, kein Canonical-/QA-Import und keine Realhost-Abnahme.

Beide tatsächlichen Rasterbilder wurden zuerst direkt angesehen: aktuelles JPG und neues PNG. Eigene fachliche Entscheidung vor dem Lesen von Edit-Prompt und Root-Review gebildet; der separate Generation-Receipt wurde erst danach zur Toolherkunft gelesen. Keine Beteiligung dieses Reviewers an der Erzeugung.

- Kandidat: `candidate.png`, 1678 × 937, `sha256:67810c41b3c974fb1fdc0cdd6c2b67101c0ff7ac9c1b26aa50b8e9cbf1d9b405`.
- Aktuelles Referenz-JPG: `sha256:095f5aed4cee2ffa62e3ae3064051647a9f5d7ec6f9175092b8bb55657f3bf1b`.
- Herkunft gemäß getrenntem Receipt: OpenAI / ChatGPT-Codex image generation, Tool `image_gen__imagegen`; exaktes Serving-Modell nicht offengelegt.

## Fachlicher Befund

- Z=diag(2,2): Z·(1;2)=(2;4) und Z·(−2;1)=(−4;2). Jeder Operand und jedes Ergebnis ist ein tatsächlicher Spaltenvektor; Produktdimensionen 2×2 · 2×1 = 2×1.
- Alle vier falschen T an den bereits vertikalen Vektoren sind entfernt; Komponenten, Klammern und Minuszeichen erhalten.
- P liegt auf x=1,y=2; P′ auf x=2,y=4; Q auf x=−2,y=1; Q′ auf x=−4,y=2. Die sichtbaren Gitterkreuzungen stimmen mit den vier Labels überein.
- O,P,P′ sind kollinear, ebenso O,Q,Q′. Die Bildpunkte liegen jeweils auf demselben Strahl mit doppeltem Abstandsverhältnis zu O. O wird durch Z auf O abgebildet.
- Blau verbindet P/P′, Rot verbindet Q/Q′; Strahlen, Achsen und Matrix zeigen dieselbe Streckung mit k=2, keine Rotation oder Verschiebung.

Geeignetes AB2-Beispiel für Matrix einer zentrischen Streckung am Ursprung und berechnete Bildpunkte. Eine positive Streckung k=2 ist ein zulässiges Beispiel; das Bild muss nicht sämtliche Parameterfälle abbilden.

## Stil und Lesbarkeit

Warmer Papiergrund, handschriftnahe Beschriftung, blau/rote Punkte und die bestehende Gitter-plus-Rechnung-Anordnung bleiben erhalten. Keine neue Darstellungssprache. Titel, Matrixeinträge, Komponentenzeichen, Minuszeichen und relevante Koordinaten/Dezimalwerte sind in der tatsächlich angesehenen PNG-Datei lesbar. Keine abgeschnittene Formel oder unlesbare nötige Zahl gefunden. Sichtprüfung am tatsächlich bereitgestellten Raster, keine neue Browser-/Mobil-/Kartenbreitenabnahme. Keine pixelidentische Erhaltung des alten JPG behauptet.

## Weiterverwendung

Keine blockierenden Befunde. `reconstruction-prompt.md` beschreibt die gesamte Grafik eigenständig einschließlich Zahlen, Notation, Anordnung und Stil; es ist nicht nur eine Editanweisung. Jede spätere Rekonstruktion bleibt neu zu prüfender Kandidat.

Die genaue maschinenlesbare Evidenz steht in `ai_candidate-review.json`. Erst am stabilen D/P-Checkpoint importieren und die betroffenen Seiten-/Kontext-/Profilbindungen prüfen. Diese Prüfung setzt keine zentralen Gate-Felder oder Abschlusszähler.

