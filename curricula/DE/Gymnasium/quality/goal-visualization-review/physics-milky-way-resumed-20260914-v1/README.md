# Milchstraße: lokaler Bildpilot vom 14. September 2026

Der unabhängig geprüfte finale PNG-Kandidat ist lokal über den nativen Import übernommen. Entscheidung: `accepted_pilot`, Provider `image_gen`, `humanApproved=false`. Keine neue Bildgenerierung, keine neue blinde D-Runde, keine Humanfreigabe und kein Deployment.

Das Bild führt alle vier Spektralbereiche zur gemeinsamen Auswertung und zeigt getrennte schematische Schräg- und Seitenansichten. Der vollständige Sichtbefund einschließlich der Lesbarkeitsgrenze bei 360 px steht in [milky-way.independent-ai-review.json](milky-way.independent-ai-review.json).

## Profilbindung und Integration

Das vollständige bestehende P-Profil wurde inhaltlich gegen den finalen Bildkontext geprüft. Fachlicher Profilkörper und historischer Dissens bleiben unverändert. Die neue Einzelbindung umfasst die tatsächlichen Bildbytes und bleibt `needs_human_review / ai_candidate / E1 / G1`.

- Neues Solo-Profil: `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-milky-way-resumed-20260914-v1/milky-way.current-image-positive-evidence.config.json`
- Sieben unveränderte Profilzeilen: `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-milky-way-resumed-20260914-v1/retained-seven.positive-evidence.config.json`
- Historisches Acht-Ziele-Config: `curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-050-current-astro-dependent-contexts-11-v1.paused-current-20260908-v1.config.json`
- Historisches Acht-Ziele-Review: `curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-050-current-astro-dependent-contexts-11-v1.paused-current-20260908-v1.review.jsonl`

Die sieben übertragenen JSONL-Zeilen sind einschließlich ihrer Zeilenumbrüche byteidentisch. Alte Config und Review wurden nicht geändert. Die zentrale Registrierung und globale Folgeartefakte übernimmt Root separat.

## Tatsächliche Historie

[generation-history.json](generation-history.json) bindet beide tatsächlich ausgeführten Editprompts und sämtliche Bildreferenzhashes. Der erste Edit ist ein nicht importierter Zwischenkandidat; der zweite lieferte das akzeptierte PNG.

Der frühere aktive [prompt.de.md](archived-original/prompt.de.md) ist byteidentisch archiviert. Ein Quell-Rekonstruktionsprompt war vor der Übernahme nicht vorhanden. Ein unter tmp gefundener Rekonstruktionsprompt gehört nach JPG-Hash zu einer anderen Ausgabe und wurde nicht als Originalhistorie übernommen. Der neue [Rekonstruktionsprompt](image-reconstruction-prompt.de.md) wurde aus dem betrachteten Endbild formuliert und nicht ausgeführt.

Alle drei Original-JPG-Kopien bleiben byteidentisch erhalten. Ihre im historischen Importbeleg genannten Source-, Public- und Backend-Pfade beschreiben den Zustand vor der anschließenden Archivierung; die Kopien liegen jetzt unter `archived-original/canonical.jpg`, `archived-original/public.jpg` und `archived-original/backend.jpg`. Neue Source-, Public- und Backend-PNGs besitzen denselben SHA-256 `853a24fc3356cc8f375735118754d7baf00d2dbc2d8985371ef877e04b853794`.

## Prüfungen und historischer Retention-Konflikt

Bestanden: nativer Import-Dry-run und Import, native Solo-Materialisierung samt Reproduzierbarkeitsprüfung, native P-Checks für 1 und 7 Ziele, Physik-VQA-Check, Graphprüfung für 593 Landschaften sowie `git diff --check`. Der explizite Schutzvergleich bestätigt 763 unveränderte andere Canonical-Ziele, 508 unveränderte andere VQA-Einträge, unveränderte Legacy-ChatGPT-/Humanfelder und sämtliche geschützte Historie.

Beim ursprünglichen Import endete der native `check:goal-visualization-assets` mit Exit 1 ausschließlich wegen der drei noch in den aktiven Assetverzeichnissen erhaltenen alten JPGs: `orphan image has no canonical primary goal-visualization link`. Dieser damalige Befund bleibt im Importbeleg unverändert erhalten. Die anschließende Archivierung folgt der bestehenden Konvention, ersetzte Bilder außerhalb der aktiven Assetverzeichnisse aufzubewahren; die Checkerregel und die aktive PNG-Referenz bleiben unverändert.

Die genauen Befehle, Ergebnisse und Hashschutzbelege stehen in [import-receipt.json](import-receipt.json) und [baseline.json](baseline.json).

## Abschluss der Archivierung

Genau die drei vorab als echte Dateien und per SHA-256 geprüften alten JPG-Kopien wurden ohne Überschreiben an freie, eindeutig benannte Archivpfade verschoben. Ihre Bytes und Inodes sind erhalten. Die drei aktiven PNGs, Canonical, VQA, P-Profile, die Checkerdatei und das historische Import-Receipt blieben dabei unverändert. Das zeit- und hashgebundene Quell-Ziel-Mapping und die wiederholte native Assetprüfung stehen im separaten [archive-move-receipt.json](archive-move-receipt.json).

Der native Assetcheck ist nach der Archivierung bestanden: 1.558 Bildreferenzen in 21 Landschaften, Exit 0. Der Retention-Konflikt ist damit für diesen lokalen Import abgeschlossen.
