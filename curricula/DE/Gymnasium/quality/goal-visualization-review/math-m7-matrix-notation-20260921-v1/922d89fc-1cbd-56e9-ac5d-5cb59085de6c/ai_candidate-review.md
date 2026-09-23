# Unabhängige Kandidatenprüfung: Grenzprozesse und Grenzmatrizen interpretieren (LK)

Datum: 21.09.2026, 21:48:35 UTC. Entscheidung: **KEEP**, Status `candidate`, Autorität `ai_candidate`. Keine Human-Freigabe, kein Canonical-/QA-Import und keine Realhost-Abnahme.

Beide tatsächlichen Rasterbilder wurden zuerst direkt angesehen: aktuelles JPG und neues PNG. Eigene fachliche Entscheidung vor dem Lesen von Edit-Prompt und Root-Review gebildet; der separate Generation-Receipt wurde erst danach zur Toolherkunft gelesen. Keine Beteiligung dieses Reviewers an der Erzeugung.

- Kandidat: `candidate.png`, 1679 × 937, `sha256:a5c6d718dd1500f140c19708f43feee528e6a74306b52eb8352ef3b907d8db15`.
- Aktuelles Referenz-JPG: `sha256:f140304ce51ca9c6968218de142bde5821abfd57faa46c2f0b5dc7a5c593e1ef`.
- Herkunft gemäß getrenntem Receipt: OpenAI / ChatGPT-Codex image generation, Tool `image_gen__imagegen`; exaktes Serving-Modell nicht offengelegt.

## Fachlicher Befund

- Spalten sind ausdrücklich Von A/Von B, Zeilen Nach A/Nach B. Spaltensummen 0,8+0,2=1 und 0,3+0,7=1; nichtnegative Übergangswahrscheinlichkeiten.
- M·g=(0,8·0,6+0,3·0,4; 0,2·0,6+0,7·0,4)=(0,6;0,4). g ist tatsächlich vertikal ohne T, daher 2×2 mal 2×1.
- G hat beide Spalten g. Die Eigenwerte der konkreten Matrix sind 1 und 0,5; deshalb konvergieren ihre Potenzen zur gezeigten Grenzmatrix. Beide gezeigten normierten Starts liefern G·v₀=g.
- Das falsche T an dem schon vertikalen g ist entfernt. Die waagerechten Startpaare und das waagerechte Schlusszahlenpaar behalten mathematisch richtige T.
- Hier ist keine räumliche Koordinatengeometrie beansprucht. Die Verzweigung verbindet zwei unterschiedliche Starts mit denselben Endanteilen. Die zwei Spaltenpfeile adressieren die beiden gleichen G-Spalten.

Geeignetes konkretes Beispiel für Grenzmatrizen und stabile Langzeitentwicklung auf LK-Niveau. Startunabhängigkeit gilt für diese gezeigte Kette und normierte Wahrscheinlichkeitsstarts, nicht als Satz über jede Markov-Kette. Keine Forderung, alle Nichtkonvergenzfälle im Orientierungsbild abzubilden.

## Stil und Lesbarkeit

Die hellblau-schwarze Kasten-/Sprechblasenlandschaft, klare Links-rechts-Führung und zwei Ergebniszweige bleiben erhalten. Keine fotografische oder sterile Neugestaltung. Titel, Matrixeinträge, Komponentenzeichen, Minuszeichen und relevante Koordinaten/Dezimalwerte sind in der tatsächlich angesehenen PNG-Datei lesbar. Keine abgeschnittene Formel oder unlesbare nötige Zahl gefunden. Sichtprüfung am tatsächlich bereitgestellten Raster, keine neue Browser-/Mobil-/Kartenbreitenabnahme. Keine pixelidentische Erhaltung des alten JPG behauptet.

## Weiterverwendung

Keine blockierenden Befunde. `reconstruction-prompt.md` beschreibt die gesamte Grafik eigenständig einschließlich Zahlen, Notation, Anordnung und Stil; es ist nicht nur eine Editanweisung. Jede spätere Rekonstruktion bleibt neu zu prüfender Kandidat.

Die genaue maschinenlesbare Evidenz steht in `ai_candidate-review.json`. Erst am stabilen D/P-Checkpoint importieren und die betroffenen Seiten-/Kontext-/Profilbindungen prüfen. Diese Prüfung setzt keine zentralen Gate-Felder oder Abschlusszähler.

