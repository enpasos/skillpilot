# K3 · Kinetische Energie herleiten

Version 1 ist ein verfasster Kandidat. Die zwei getrennten Blindbewertungen stehen aus. Der kanonische Katalog und die Ansichten werden durch dieses Paket nicht verändert.

[Aufgabe, Lösung und Bewertungsregeln in beiden Sprachen](task-and-marking.md) · [Exaktes atomares Zielobjekt](candidate.goal.json) · [Raster](rubric.json) · [Beabsichtigte 14 Ansichten](scope.json)

Die gemeinsame Aufgabe verbindet die grafische Herleitung mit Arbeitsdefinition, Newton II und Bewegungsgesetzen. Die vier tragenden Leistungen haben je 3 Punkte; allein 10 von 12 Punkten genügen zum Bestehen. Jede vollständig ausgelassene oder ausdrücklich beibehaltene falsche Kernleistung verliert damit mehr als den Spielraum von 2 Punkten. Ein nachgewiesener kleiner Formfehler kostet einmal 0,5 Punkte an seiner Quelle. Kraftpfeile, Zahlenrechnung und Integralrechnung sind nicht erforderlich. Ein beschriftetes Diagramm darf im Coachchat vollständig beschrieben werden.

Der Kandidat verlangt und deckt ausschließlich `2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b` ab. Er ist als regulärer Abschluss des Herleitungsziels in 8 HE-, 4 SL- und 2 SN-LK-Ansichten vorgesehen. Er ist keine Abschlussprüfung einer ganzen Untereinheit. Die Auswahl einzelner Ansichten bleibt Aufgabe der geprüften Integration; das allgemeine Länderfeld behauptet keine Freigabe des sächsischen Grundkurses.

Grundlage ist der akzeptierte Knotenreview M vom 26. November 2026 und der Zuschnitt vom 26. November 2026, 03:45 CET. Die Quelle wurde für dieses Authoring nicht neu ausgelegt: Einsetzen der bekannten Formel und reine Energiebilanzen erfüllen das neue Herleitungsziel nicht. Das Zeit-Geschwindigkeits-Dreieck liefert den grafischen halben Faktor, die Verknüpfung mit Newton II die Formel. Das entspricht dem in M empfohlenen gemeinsamen elementaren Weg.

Für die getrennten Gutachter sind nur der Kandidat, das Aufgaben-/Bewertungsdokument sowie die Dateien unter [blind/](blind/instructions.md) bestimmt. Die 18 vollständigen, neutral bezeichneten Abgaben liegen deutsch und englisch vor. Es gibt Fälle mit einer einzelnen fehlenden Facette, mehrere kleine isolierte Fehler, fehlende ganze Leistungen, beibehaltene Fehlvorstellungen, eine Selbstkorrektur und gleichwertige symbolische Herleitungen. Die Blinddateien enthalten keine erwarteten Bewertungen.

[Autorenerwartungen](author/expectations.json), [Entstehungsnachweis und Dateidigests](author/manifest.json) und der [Authoringquelltext](author/build-candidate.py) bleiben von den Blindgutachten getrennt. Tool: Codex collaboration agent; Modell: `gpt-6.1-sol`, Denktiefe `ultra`. Diese Erwartungen sind keine unabhängige Bewertung. Es wurde kein anderer K3-Marker gelesen und kein Review verfasst.

Lokale Strukturprüfung:

```bash
node curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/k3/v1/validate-candidate.mjs
```

Sie prüft Identität, ausschließliche Abdeckung, Punktesumme, 85-Prozent-Grenze, Gewicht jeder tragenden Leistung, UTF-16-Längen, Sprachfelder, die 14 beabsichtigten Ansichten, neutrale Blinddateien, Rechenrichtigkeit der getrennten Autorenerwartungen und die verzeichneten Dateidigests. Sie bewertet keine freie Abgabe und ersetzt weder unabhängiges Fachgutachten noch Katalog-/CI-Prüfungen. [Ergebnis](author/validation.actual.json)
