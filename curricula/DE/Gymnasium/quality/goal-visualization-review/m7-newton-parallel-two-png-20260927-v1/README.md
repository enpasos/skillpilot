# Zwei Mathematik-Bilder: Newton und Lagebeziehungen (2026-09-27)

## Geltungsbereich und Entscheidung

Nur die beiden folgenden **exakten Bitmap-Dateien** wurden nach eigenständiger Sichtung bei 1672 × 941 px und in der 360-px-Kartenansicht als KI-geprüfte V-Kandidaten importiert. Das ist weder eine menschliche Bildfreigabe noch eine Lernwirksamkeitsprüfung.

| Ziel | Aktueller PNG-SHA-256 | Fachliche Sichtung |
| --- | --- | --- |
| `0c7bbd3f-0a04-4f0e-888b-40ab7841fb76` – Newton-Verfahren | `ff3477c02aef5f17fdf46412b4f1c3eed0c1672bcc3eb0ecacc605c6ba85543e` | Die Kurve zu `f(x)=x²−2`, die Schritte `2 → 1,5 → ≈1,4167`, die Tangentenkontakte und die Annäherung an `√2≈1,4142` sind in sinnvoller Reihenfolge gezeichnet. Der Hinweis „Geeigneter Startwert nötig“ verhindert eine unbedingte Konvergenzbehauptung. Die Zeichnung ist Anschauung, kein maßstäblicher Beweis. |
| `2231c29b-eb4e-51ae-9cb1-eb033bf16099` – parallel/senkrecht | `cd00825a38ef96a2fe1696a6b02cc4177f7bf689c49137eb2e635f8217bf270f` | Links sind die farbigen Linien parallel, rechts schneiden sich die Diagonalen mit Rechtwinkelmarkierung nahezu rechtwinklig. Die dokumentierte Pixel-Linienmessung lag bei etwa 89,84°, nicht bei behaupteten exakt 90°. Text und Formen bleiben in der kleinen Ansicht lesbar. Die Markierung ist eine Bedingungsillustration, kein Beweis. |

Die Quellkandidaten liegen in `tmp/math-m7-image-prompts-2026-09-27/images/` und wurden über `visualization:prepare` und `visualization:import` in die kanonischen, öffentlichen und Backend-Assets übernommen. Alle drei Kopien je Ziel haben den oben angegebenen Digest. Der verwendete Generator war die eingebaute OpenAI/ChatGPT-Codex-Bildgenerierung; ihr konkretes Modell wurde nicht exponiert und wird daher nicht geraten. Die exakten finalen Prompts stehen in den jeweiligen kanonischen `prompt.de.md`. Frühere Prompt- und Rekonstruktionsmetadaten sind unter `previous/` erhalten, statt als aktuelle Herkunft weitergeführt zu werden. Vorstufen mit kleinem Newton-Inset bzw. ungenauer Senkrechtlage wurden nicht übernommen. Die geometrischen SVG-Referenzen waren nur Editierhilfen; das ausgelieferte Ergebnis ist jeweils ein generiertes PNG.

## Bindungen der nachgelagerten Prüfungen

- **V:** Die beiden `mathematik.qa.json`-Einträge wurden erst nach Sichtung des tatsächlich importierten PNGs mit `aiApproved=yes` und dessen exaktem `aiApprovedAssetSha256` aktualisiert. `humanApproved=no`. Die V-Deckungsprüfung meldet 778 aktive freigegebene Visualisierungen und 0 anstelle von V gezählte Pilot-Ausnahmen.
- **P:** Die bestehenden fachlichen Profile wurden beibehalten, ihre Anwendungsfälle aber am aktuellen Bild und an der Mathematik erneut geprüft. `positive-binding-review.json` dokumentiert alte und aktuelle Fingerprints. `positive-current-two.review.jsonl` ist ein **E1/G1-KI-Kandidat** (`needs_human_review`), keine menschliche Zustimmung. Für Newton sind insbesondere `7/4`, `97/56`, Residuum `1/3136`, undefinierter Start bei 0 und der Zweierzyklus `0→1→0` geprüft. Für Lagebeziehungen bleiben gedrehte und nur ausschnittweise sichtbare Linienpaare echte Transferfälle. Das unveränderte dritte Ziel aus dem alten Paar-Review liegt separat in `positive-retained-other.review.jsonl`. Die aktiven P-Konfigurationen referenzieren nur die neuen, zum PNG passenden Dateien.
- **D:** Die alten D-Seiten waren nicht an diese aktuellen Bilder gebunden: Newton enthielt kein Bild, Lagebeziehungen ein anderes Bild (`sha256:313421…`). Daher wurden **nur diese zwei** alten Resolutionen aus den aktiven Indizes entfernt, nicht aus der Historie gelöscht. `d-hold-receipt.json` nennt alte Seitenfingerprints und die neuen Retained-Indizes. Der aktuelle Zwei-Seiten-Batch `m7-newton-parallel-two-png-20260927-v1` ist vorbereitet; unabhängige Reviews und Synthese sind eine getrennte Freigabe. Bis dahin bleiben beide D-Gates auf HOLD.

## Reproduzierbare gezielte Kontrollen

Vom Verzeichnis `app/` aus:

```bash
./node_modules/.bin/tsx scripts/materializeMathM7NewtonParallelPDelta.ts --check
./node_modules/.bin/tsx scripts/materializeMathM7NewtonParallelDHolds.ts --check
npm run check:goal-visualization-qa -- --subject=mathematik
npm run check:goal-visualization-approval-coverage -- --subject=mathematik
npm run quality:goal-description-rollout-batch -- check --config curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-newton-parallel-two-png-20260927-v1.config.json
```

Alle fünf gezielten Kontrollen waren am 2026-09-27 erfolgreich. Die isolierte Gate-Wirkung ist **V +2**, P nach exakter Neubindung **+2 zurückgewonnen**, D wegen aktuellem Bild **−2 bis zur neuen Doppelreview**, also **kein vorgezogener Gewinn** beim strengen D/P/A/M/V-Schnitt. Es wurde keine menschliche QS oder Abschlussprüfung behauptet.
