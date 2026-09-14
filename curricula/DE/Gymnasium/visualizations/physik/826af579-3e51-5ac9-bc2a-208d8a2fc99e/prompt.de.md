# Lernzielvisualisierung: Teleskope und Spektralbereiche zur Struktur der Milchstraße nutzen

## SkillPilot-Ziel

- SkillPilot-ID: `826af579-3e51-5ac9-bc2a-208d8a2fc99e`
- Titel: Teleskope und Spektralbereiche zur Struktur der Milchstraße nutzen
- Beschreibung: Die lernende Person kann Teleskope für verschiedene Spektralbereiche vergleichen, Beobachtungsdaten aus mehreren Bereichen zusammenführen und daraus die Struktur der Milchstraße beschreiben.

## Generator

- Provider: image_gen
- Status: pilot
- Quellbild: `826af579-3e51-5ac9-bc2a-208d8a2fc99e.png`
- Public Asset: `/assets/goal-visualizations/physik/826af579-3e51-5ac9-bc2a-208d8a2fc99e/826af579-3e51-5ac9-bc2a-208d8a2fc99e.png`

## Prompt

```text
Use case: precise-object-edit
Asset type: bestehende deutschsprachige Physik-Unterrichtsgrafik.
Input images: Image 1 ist das einzige Edit-Ziel.

Ändere genau zwei missverständliche Elemente, alles andere bleibt erhalten:
1. Ersetze im oberen Ansichtslabel ausschließlich „Draufsicht“ durch „Schrägansicht“. Das ganze Label lautet danach „Schrägansicht (schematisch)“. Die obere Spiralgalaxienzeichnung selbst bleibt unverändert; keine neue Geometrie und keine Draufsichtbehauptung.
2. Bündele die vier bisherigen farbigen Eingangspfeile zu einem einzigen gemeinsamen Auswertungsschritt, bevor die Daten das Modell erreichen. Alle vier linken Spektralbereichsfelder liefern sichtbar an dieselbe gemeinsame Sammelstelle beziehungsweise dieselbe zusammenhängende vertikale Sammellinie im bisherigen Pfeilkorridor. Von dieser Sammelstelle führt genau EIN gemeinsamer neutraler Pfeil zum gesamten rechten Modellrahmen. Er endet am Rahmen, nicht an einer einzelnen Ansicht oder einer Galaxienstruktur. Es dürfen keine separaten Pfeile mehr von einzelnen Spektralbereichen zur Schrägansicht oder zur Seitenansicht führen. Alle vier Datenquellen werden gemeinsam ausgewertet, nicht je zwei pro Perspektive.

Nutze für die gemeinsame Sammellinie und den einzigen Ausgangspfeil den bestehenden Zwischenraum der bisherigen Pfeile. Die vier Eingänge behalten ihre bisherigen Farben. Falls gut lesbar und ohne Überdeckung möglich, ergänze an der gemeinsamen Sammelstelle „Gemeinsame Auswertung“; diese kurze Zusatzbeschriftung darf entfallen, wenn die eindeutige Vier-zu-eins-Bündelung für sich verständlich ist. Die Zusammenführung darf weder Text überdecken noch als fünfter Spektralbereich erscheinen. Kein Entfall vorhandener Inhalte, um Platz zu gewinnen.

Strenge Invarianten: Die gemeinsame Überschrift „Aus Beobachtungsdaten erschlossenes Modell“ bleibt vollständig erhalten. Beide getrennten Galaxienansichten, Trennlinie, unteres Label „Seitenansicht (schematisch)“ und alle Labels „Zentrum“, „Spiralarme“, „Scheibe“ bleiben bestehen. Die ganze Hauptüberschrift „Milchstraße in Spektralbereichen“, der obere Instrumentenstreifen samt allen Geräten/Symbolen, sämtliche vier linken Beobachtungsfelder mit allen bisherigen Texten und Bildinhalten, ihre Reihenfolge und Farben bleiben vollständig erhalten. Gleicher handgezeichneter Schriftstil, dunkle Konturen, Bildseitenverhältnis, deckender Hintergrund und Farbwelt. Keine neue Fachinformation, keine zusätzlichen Geräte oder Themen, keine Formeln, kein Wasserzeichen.

Dieser Edit korrigiert nur die Perspektivbezeichnung und die Datenfluss-Zuordnung. Die zwei Galaxienbilder müssen nicht neu gezeichnet werden.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.

## Tatsächliche Edit-Historie und Referenzen

Der oben gespeicherte Prompt ist ausschließlich der tatsächlich ausgeführte zweite Editprompt. Er ist keine nachträglich erfundene Neugenerierung. Das aktuelle PNG entstand aus zwei aufeinanderfolgenden Aufrufen von `tools.image_gen__imagegen`; der genaue Modellname und die Generierungsparameter wurden vom Werkzeug nicht ausgewiesen.

- Historisches aktives Original: `826af579-3e51-5ac9-bc2a-208d8a2fc99e.jpg`, SHA-256 `6cbf760c81b098f3a3099831d7613fc4c950eb1f7e4e0b8adc26497c9cb1716f`; Herkunft der alten Metadaten: Google Gemini / Nano Banana Pro. Alle drei Original-JPG-Kopien bleiben unverändert erhalten. Der frühere `prompt.de.md` liegt byteidentisch unter `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-milky-way-resumed-20260914-v1/archived-original/prompt.de.md` (SHA-256 `b3a7516276ce60ad5729222fabf3b77d3a4363ed479f680fdf4939f8f00f23f8`). Ein Rekonstruktionsprompt lag vor diesem Import in der aktiven Quellablage nicht vor.
- Edit 1: tatsächlicher Prompt `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-milky-way-resumed-20260914-v1/edit-01.actual-prompt.de.md`, SHA-256 `6c13db70bec18e105356bd1e5d16dc1bff3d5a77d74e347b35a41430be6490a0`. Einzige Bildreferenz war das Original-JPG mit Hash `6cbf760c81b098f3a3099831d7613fc4c950eb1f7e4e0b8adc26497c9cb1716f`. Ergebnis: `940b81981a5f5db64c27c356a251e53926318d21b56610bdace1741ebc8043b7`; getrennte Ansichten, aber noch missverständlicher Draufsichttitel und getrennte Eingangspfeile.
- Edit 2: tatsächlicher Prompt `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-milky-way-resumed-20260914-v1/edit-02.actual-prompt.de.md`, SHA-256 `3256947022e295f857e6d3176f39c834d3b3e908d6180950ceb614ad09d509c7`. Einzige Bildreferenz war das Edit-1-Ergebnis mit Hash `940b81981a5f5db64c27c356a251e53926318d21b56610bdace1741ebc8043b7`. Finales Ergebnis und alle drei importierten PNG-Kopien: `853a24fc3356cc8f375735118754d7baf00d2dbc2d8985371ef877e04b853794`.
- `image-reconstruction-prompt.de.md` wurde nach Sichtung des finalen Rasters als eigenständige künftige Rekonstruktionsbasis formuliert und bei dieser Übernahme nicht an einen Bildgenerator gesendet.

Die unabhängige KI-Sichtprüfung ist unter `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-milky-way-resumed-20260914-v1/milky-way.independent-ai-review.json` gebunden. Entscheidung: `accepted_pilot`; keine Humanfreigabe, kein Deployment.
