# W1: Bilder und Karten

Vier neue Bilder für B, G, T und F sowie drei korrigierte Bilder für `5f289cdc`, `30ddb2d7` und `e2da5eec` sind als 1600 × 900 JPEG importiert. Alle sieben Originaldateien und ihre 360-px-Ansichten wurden tatsächlich geöffnet. Die aktuellen Ansichten stehen in `render/`. Die sechs präzisen Diagramme werden einheitlich skaliert und seitlich eingerückt; ihre Kraftgeometrie wird nicht gestreckt. Das vollständig erzeugte Bild zur gegebenen Resultierenden behält ebenfalls sein Seitenverhältnis.

Die drei bisherigen Bilder und ihre unveränderten QA-Zeilen stehen in `predecessors/`. Die Korrekturen entfernen frei platzierte Größenpfeile und fehlende Maßstäbe; das Kurvenbild verwendet jetzt einen **gegebenen** Höchstwert von 5000 N, keinen Reibungskoeffizienten. Das Bild zu `5f289cdc` liefert die Resultierende ausdrücklich als Angabe und verlangt keine neue Bilanzleistung. Das Reibungsmodell endet beim Stillstand, statt den Körper rechnerisch unphysikalisch umkehren zu lassen.

Die vier neuen logischen Karten und die korrigierte Karte `physics_e_cov_041` liegen jeweils auf Deutsch und Englisch im bestehenden Mechanikdeck. `cards.actual.json` hält die zehn Texte und die fünf Karten- sowie vier Zielentscheidungen der tatsächlichen KI-Autorenprüfung fest. Die aktiven nativen Zeilen stehen in `quality/memory-card-review/canonical-physics-full.review.jsonl` und `.cards.review.jsonl`. Dies ist keine unabhängige oder menschliche Abnahme. Insbesondere ersetzt Kartenabruf weder die freie Kräftebilanz noch eine selbstständige Konstruktion oder einen neuen Modelltransfer.

## Anbieter und begründete präzise Diagramme

Verwendet wurde das eingebaute Werkzeug `image_gen`, ohne API-/CLI-Ausweichweg. Die tatsächlichen Vollbildversuche stehen in `generation-attempts/`; ihre Prompts stehen in `prompts.actual.json`, `B-prompts.actual.txt` und dem Produktionsprompt für die gegebene Resultierende. Beim ersten B-Versuch passten weder beide Pfeillängen zueinander noch ihre gemeinsame Bezugsskala. Eine gezielte Werkzeugkorrektur löste das nicht. G und T verfehlten die maßstäbliche Zerlegung, F und das geradlinige Reibungsmodell ihre Bezugsskalen. Im Kurvenbild fehlte am Pfeil eine Null (200 N statt 2000 N). Diese Kandidaten sind nicht aktiv.

Die fachlich begründete enge Ausnahme ist daher eine präzise Kraftzeichnung mit tatsächlich erzeugten freundlichen Körperillustrationen. `sources/block.png` und `sources/car.png` stammen aus weiteren tatsächlichen `image_gen`-Aufrufen mit transparentem Hintergrund. `render-material.mjs` setzt sie in ruhige Diagramme mit präzisen Kraftpfeilen und eigener Legende. Die fertigen Bilder bleiben Rasterillustrationen; weder technische Platzhalter noch verworfene Diagramme werden als Anbietererfolg ausgegeben. Das Bild zur gegebenen Resultierenden ist vollständig erzeugt; dessen drei Bezugslängen passen innerhalb der sichtbaren Strichbreite.

| Bild | Kraftlängen im fertigen 1600-px-Bild | Kraft-Bezugsstrich |
|---|---|---|
| B | 540 px für 6 N; 360 px für 4 N | 180 px für 2 N |
| G | 288 px für 40 N; 144 px für 20 N; rund 249,415 px für 34,641 N | 72 px für 10 N |
| T | 288 px für 60 N; 144 px für 30 N; rund 249,415 px für 51,962 N | 48 px für 10 N |
| F | 270 px für 30 N; 225 px für 25 N | 90 px für 10 N |
| Geradlinige Reibung | 360 px für 4 N | 180 px für 2 N |
| Kurvenfahrt | 180 px für 2000 N | 90 px für 1000 N |

`image-inspection.actual.json` bindet jede tatsächliche Sichtprüfung an Bild und 360-px-Vorschau. `image-decisions.actual.json` enthält die nativen Nachweise für das Pfeilkriterium. Die aktive Physik-Bild-QA und das Rollout-Ledger wurden aktualisiert. Die sieben direkten Prüfentscheidungen bestehen die native Pfeilevidenzvalidierung: sieben angenommen, keine ausgenommen, offen oder verworfen. Bild-QA-Synchronität und globaler Assetcheck bestehen.

## Offener nativer Memory-Gatebefund

Die zwei aktuellen Diagnosen aus dem tatsächlichen Produktionsauswerter stehen in `cqr302-visibility.actual.json`:

> canonical-physics-full: visibility coverage required: Die Gewichtskraftkomponenten am Hang berechnen [43b2c500-bbd9-5c92-9f3e-618d310e5690] is not visible in any configured scope
>
> canonical-physics-full: visibility coverage required: Haften und Gleiten mit der Normalkraft beurteilen [3a2accd7-639f-50e1-a7b1-5a9d3c2432a6] is not visible in any configured scope

Der native Kartencheck hat keine fehlenden oder veralteten Kartenentscheidungen und keine Herkunftsfehler. Er scheitert an diesen zwei Sichtbarkeiten sowie zum aufgezeichneten Zeitpunkt an der separat bearbeiteten veralteten Zielentscheidung von `5f289cdc`. Das vollständige Ergebnis steht in `memory-review-check.actual.log`; Eingabepfade und Hashes stehen in `cqr302-inputs.actual.json`. Eine zusätzliche ausschließlich lesende Messung aller 90 aktuellen Physikansichten findet T und F ebenfalls in keiner Sicht; sie benutzt zur Auflösung fremder Katalogeinträge die vollständige aktuelle Katalogkarte und verändert weder Gate noch Konfiguration (`cqr302-all90-diagnostic.actual.json`).

Eine etablierte Produktionsoption für nur zur Prüfung eingeschriebene beibehaltene Karten existiert hier nicht: `kept` verlangt ein gewöhnliches atomares Verständnisziel, dessen aktuelle Entscheidung `memory_required` lautet. Die verpflichtende vollständige Sichtabdeckung verlangt danach für jedes solche Ziel mindestens eine konfigurierte Ansicht. Weder Status noch Herkunft oder Sichtbarkeit wurden zur Umgehung geändert. Dieser Gatekonflikt bleibt offen.

## Kopien und automatisierte Prüfungen

`runtime-copies.actual.json` bestätigt sieben identische Bildsätze (Qualitätsartefakt, kanonische Quelle, App, Backend) und zwei identische Decksätze (Quelle, App, Backend): neun von neun Vergleichen gleich. `visualization:prepare` und `visualization:import` wurden für alle sieben Ziele mit explizitem Anbieter, eigener CC-BY-4.0-Lizenz, tatsächlichem Produktionsprompt und konkretem Alttext verwendet.

`deploy:assets` hat beide Decksprachen kopiert. Danach brach der Gesamtlauf an einer schon vorhandenen Biologie-Ausgabedatei mit mehreren Hardlinks ab. Das wird nicht als erfolgreicher Gesamtlauf ausgegeben. Die sieben Bildimporte hatten ihre eigenen Runtimekopien bereits geschrieben. Der globale Bild-Assetcheck besteht anschließend für 2591 Links in 21 Katalogen (`image-assets-check.actual.log`).

## Nachfolger: Aktivierungsentscheidung vom26.November2026,16:59 CET

Der oben aufgezeichnete Stand mit sieben Bildern, vier neuen Karten und dem offenen T/F-Sichtbarkeitsbefund bleibt die tatsächliche frühere Prüfung. Der aktive Umfang ist jetzt B/G mit KB/KG. T/F/KT/KF und ihre unveränderten fachlichen Materialien, Profile und Zeichnungsbelege sind unter `../parked/t-f-reviewed-candidates-20261126/` geparkt. Fünf Bilder bleiben aktiv; zwei Bildsätze sowie je zwei Karten pro Sprache wurden aus den aktiven Quellen und Runtimekopien entfernt. Das Mechanikdeck enthält nun94 Karten je Sprache. Ausschließlich die beiden T/F-Ziel- und T/F-Kartenzeilen wurden aus den zentralen Memoryzeilen entfernt. Kein alternativer Sichtbarkeitsstatus und keine abgesenkte Gatebedingung wurde eingeführt.

`activation-1659/media-scope-and-parity.actual.json` bindet den tatsächlich geprüften aktuellen Umfang. Native Rollout- und Assetprüfungen werden dort als eigene Laufdateien geführt. Die sieben ursprünglichen Sichtprüfungen, tatsächlichen Erzeugungsversuche und markierten Aufgaben bleiben unveränderte Evidenz; sie bedeuten keine aktuelle Aktivierung der geparkten Kandidaten.
