# SH-T085 R3: unabhängiges Visual- und Locatorreview

**GO / keep für die exakten R3-Bildbytes und die Locatorreparatur.** Die beiden offenen R2-Punkte V1 (Lesbarkeit im kleinen Bildcontainer) und E1 (relativer Quellenlocator) sind im geprüften R3-Stand behoben. Es ist keine weitere Grafik- oder Locatorreparatur erforderlich.

Gebundene Eingaben:

- R3-Manifest: `7d330b2b94fe41f55e27955c09d4d33e0c22e17903c827ab7722917078e41f6d`; alle 48 darin aufgeführten Dateien stimmen in Hash und Länge.
- R3-Reviewdossier: `6ed49b21ffb47e89ab95b63b2f8227cec5243ac1463374b5aa7909238f5f78dc`; sämtliche Dossiereingaben ebenfalls geprüft.
- Vollständige Review-Eingabemenge einschließlich R2-Freeze, R2-Urteil, Original-PDF, aufgelöstem Quelltext und GoalCard-Quelle: 89 Dateien, 5.349.015 Bytes, Bündelhash `2055671800d824a8f0c061eb9e67938954f86d0176b0453339e57b11277c8bfd`. Serialisierung und Einzelpins stehen in der JSON-Datei.

Reviewer: `/root/astra_sh_tools_review`, getrennt von der Autorenarbeit. Für diese Reviewinstanz bestätigte Root die angeforderte Konfiguration `gpt-6-astra`, `ultra`, `fork_turns=none`; sichtbare Systemidentität ist Codex auf GPT-6-Basis. Eine verborgene Deployment-/Patchversion wird nicht attestiert. Das ausdrücklich angeforderte R2-Urteil wurde gelesen. Die neue Bildbewertung erfolgte selbstständig an den tatsächlichen R3-Artefakten.

## Sichtprüfung und unabhängige Chromium-Reproduktion

Beide nativen 1280×1280-PNGs sowie sämtliche sechs vollständigen Kartenscreenshots wurden tatsächlich mit `view_image` geöffnet. Bewertet wurden DE und EN bei 360, 640 und 747 CSS-Pixeln Außenbreite. Zusätzlich wurde Chromium 147.0.7727.15 unabhängig gestartet, die eingefrorenen HTML-Dateien mit den exakten neuen PNGs über einen lokalen Server geladen und jede Karte erneut im Speicher gerendert. Alle sechs unabhängigen Karten-Screenshots sind **bytegleich** mit den tatsächlich geöffneten Autoren-Screenshots. Die Autorenprüfung wurde dafür nicht als Freigabebeweis übernommen und kein Autorenskript ausgeführt.

| Außenbreite | Bild-Element | Sichtbarer quadratischer Bildinhalt | Ergebnis DE / EN |
| --- | --- | --- | --- |
| 360 px | 316×316 px | 316×316 px | lesbar / lesbar |
| 640 px | 596×448 px | 448×448 px, mittig | lesbar / lesbar |
| 747 px | 703×448 px | 448×448 px, mittig | lesbar / lesbar |

Der 360-Pixel-Fall enthält wirklich 20 Pixel Kartenpadding sowie Karten- und Figure-Rahmen. Er wurde nicht mit einer 360 Pixel breiten, randlosen Grafik verwechselt. `object-fit: contain` und die tatsächliche 448-Pixel-Höhenbegrenzung wurden im Browser erneut gemessen. Alle sechs Fälle haben keinen horizontalen Überlauf. Die vollständige Zielbeschreibung entspricht jeweils exakt dem unveränderten R2-Text.

Im kleinsten Fall sind die Überschriften und Ergebnislabels unmittelbar lesbar; die kleinste nominelle Bildschrift entspricht etwa 16,46 CSS-Pixeln. Die beiden Spalten bleiben unterscheidbar. Kein Label wird abgeschnitten, und zwischen den Zeilen und Ergebnisangaben gibt es keine inhaltlich störende Überdeckung. Der deutsche lange Text „Keine gemeinsame Lösung“ nutzt die verfügbare Breite eng, bleibt im tatsächlichen Screenshot aber vollständig und gut lesbar. Die größeren Fälle verbessern die Lesbarkeit weiter.

Die Geometrien vermitteln nutzbare Information: eine durchgehende Lösungsgerade; drei Geraden mit einem gemeinsamen markierten Schnittpunkt; drei verschiedene paarweise Schnittpunkte ohne gemeinsamen Dreifachschnitt; drei auf derselben Geraden liegende Darstellungen. Im redundanten Fall bleiben die überlagerten Farb-/Strichmuster erkennbar, zusätzlich trägt das große Label „Gleiche Gerade / Same line“ die Aussage. „Viele Lösungen / Many solutions“ ist hier sachlich richtig; die unveränderten Texte enthalten weiterhin den vollständigen unendlichen Lösungsanspruch. Die Abbildung dient der begrifflichen Unterscheidung, nicht als numerisch abzulesendes Koordinatendiagramm für die Prüfung.

Die reproduzierte **Bildcontainergeometrie** entspricht den überprüften Klassen in `GoalCard.tsx` (Padding, Rahmen, volle Bildbreite, `max-h-[28rem]`, `object-contain`). Die statische HTML-Karte vereinfacht die umgebende Typografie und Bedienelemente; sie ist kein vollständiger React-Komponententest. Diese Unterschiede ändern die geprüfte Bildbreite und Höhenbegrenzung nicht. Das GO umfasst die sechs lokalen statischen CSS-Fälle ohne Zoom und keine reale Lernersitzung, tatsächliche mobile Hardware, Providerdarstellung oder Hostabnahme.

## Mathematische Erhaltung und Sprachgleichheit

Die ersten vier R2-Fälle sind erhalten:

1. `x+y=4`: eine Lösungsgerade mit unendlich vielen Punkten.
2. `x+y=4`, `x-y=0`, `2x=4`: genau der gemeinsame Punkt `(2,2)`.
3. `x+y=4`, `x-y=0`, `2x=6`: paarweise Punkte `(2,2)`, `(3,1)`, `(3,3)`, kein Punkt aller drei Gleichungen.
4. `x+y=4`, `2x+2y=8`, `-x-y=-4`: dieselbe Gerade für alle drei Gleichungen.

Die algebraischen Klassifikationen wurden gegen die gezeichneten Linien und Punkte nachvollzogen. Ein unabhängiger AST-Vergleich bestätigt dieselben 15 mathematischen Daten-/Domain-Aufrufe (`plot`, `scatter`, `axvline`, `linspace`, `set_xlim`, `set_ylim`) in R2 und R3. Die Zuordnung der vier Fälle wurde zusätzlich im Code und visuell geprüft. Änderungen betreffen Anordnung, Schrift, Linienstärken und das Weglassen kleiner Legenden/Zahlachsen. Die Linienlage wird nicht verfälscht. Alle vier Plotregionen der deutschen und englischen neuen PNG sind pixelgleich; die sichtbaren Sprachtexte sind inhaltlich gleichwertig.

Die Nullgleichungsfälle bleiben unverändert in Aufgaben, Lösungen und vollständiger Zielbeschreibung. Das Entfernen ihrer zwei kleinen Panels aus der primären Illustration reduziert weder das Ziel noch die normale Prüfungsanforderung. Die große neue Abbildung enthält keine Autoren- oder Prüfungsfreigabemetadaten.

## R2-Inhalte und Freeze bleiben erhalten

Alle zehn übernommenen Dateien wurden direkt als rohe Bytes mit R2 verglichen: `candidate.json`, `tasks.md`, `rubric.json`, `rubric-and-solutions.md`, `own-contract-candidate.json`, `assessment-examples.json`, `historical-baseline-boundary.json`, `r1-freeze-bindings.json`, `scope-integration-dossier.json` und `supplement-cluster-candidate.json`. Alle sind identisch. Sämtliche 36 im unabhängigen R2-Urteil gebundenen Eingabedateien sind weiterhin hash- und längengleich.

Der gelesene R2-Review ist exakt `5253f42ee299e7df09d782d328d9130e6644858d7c6c6ed59ea0e4cd1ffa035e`. Seine positive Richtung für exakte Inhalte, normale BE, Own und R wird durch diese Gleichheit erhalten. Dieses gezielte Review eröffnet keine neue inhaltliche oder normative Genehmigung. Die Contentrevision bleibt R2; die Darstellung erhält R3. IDs, gewöhnlicher Zieltext, Prüfungspayload, normale 0/4/5-BE, 26/30-Grenze und frühere M-Bedeutungen wurden nicht geändert.

## Quellenlocator E1

Der strukturierte Vergleich von `source-evidence.json` gegen R2 ergibt genau eine Änderung: `#/stageWidePlacementSource/privateTextPath` verweist jetzt auf `../sh-t085-authoring/baseline/sh-source-page-26.txt`.

Relativ zum tatsächlichen R3-Verzeichnis löst dieser Pfad auf eine vorhandene Datei mit 5084 Bytes und SHA-256 `91e436161b40e0d15733d771e56d54e35909b1062820488f19e06a2c943b67e6` auf. Eine frische Ausführung von `pdftotext -f 26 -l 26 -layout` auf dem Original-PDF liefert **exakt dieselben Bytes**. Das Original-PDF stimmt mit seinem gebundenen Hash `17d35f8bb5129819c7de5040c5edfbe355e58cfcd01f43f694029b3b841e0d28` überein.

Die Originalseite erläutert tatsächlich den Verzicht auf eine feste Zuordnung nach Jahrgangsstufen. Die Reparatur stellt die Erreichbarkeit dieses bestehenden Belegs her; sie erfindet weder eine neue Quellenpassage noch eine neue Scopeaufnahme.

## Entscheidungsgrenze

V1 und E1 sind für diese exakte private R3-Revision geschlossen. Es gibt keine erforderliche weitere Reparatur innerhalb dieses gezielten Reviews. Die spätere Verknüpfung und Auslieferung der neuen Bildbytes, aktuelle Source-/Scope-/Own-/V8-Bindung, normative Aktivierung, formale M7-Prüfung, menschliche Freigabe sowie tatsächliche Runtime-/Hostabnahme bleiben getrennte Vorgänge. Historische V7/648-Evidenz wird hier nicht als aktuelle native Gleichheit behandelt.

Geschrieben wurden ausschließlich diese beiden privaten Reviewdateien. R2-/R3-Autoreneingaben, normative Daten, Anwendungscode, Git und Produktionszustand wurden nicht geändert. Der unabhängige Browserlauf hielt seine neuen Screenshotbytes nur im Speicher.
