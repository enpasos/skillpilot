# Mathematik B039 – P-v2-Autorenkontext

20 Ziele in der unveränderten Reihenfolge der eigenen nativen D-Round-A-Eingabe; keine Round-B-Unterlagen gelesen. Die frühere Round-A-Ablage bleibt unverändert.

## Autorität und Bindung

OpenAI/Codex-Autorenarbeit; das genaue zugrunde liegende Modell ist nicht verlässlich bekannt. Alle 20 Profile sind E1/G1-AI-Kandidaten, nicht menschlich geprüft und kein Nachweis realer Lernendenleistung. Die native Materialisierung muss status `needs_human_review`, reviewAuthority `ai_candidate` und reviewRunIds `[]` setzen. Keine Modellvielfalts- oder unabhängigen Personenbehauptung.

Beobachtetes P-Arbeitsfenster begann 2026-09-06T23:09:46Z; dies ist ein beobachteter Dokumentationsbeginn, nicht die genaue Agent-Invocation. reviewedAt dokumentiert die Kandidatenerstellung. Keine verborgenen Provider-Traces oder erfundenen Startzeiten.

Die Konfiguration bindet ausdrücklich reviewedResourceTypes: []. Bildqualität wird nicht als P-Abnahme ausgegeben. Die getrennte D-Prüfung sichtete 19 aktive Bilder; das Ziel 47400de4-b0e4-5bb6-a1bd-bd2beee616bb hatte keinen aktiven Bildlink. Reparaturen der Bilder 70a21623 und gegebenenfalls 12a8dffc werden durch den Hauptagenten separat bearbeitet.

Der Hauptagent hat die beiden kanonischen DE/EN-Korrekturen abgeschlossen und die native P-Bindung ausdrücklich freigegeben. Die Lieferung enthält daher zusätzlich eine nativ materialisierte und verifizierte .review.jsonl mit 20 aktuellen AI-Kandidaten. Die betroffenen Grenzen sind:

- 51e80e7b-df31-5d97-97f9-4c6e26eb7416: reelle Linearfaktoren nur soweit möglich; irreduzible reelle Restfaktoren sind zulässig.
- 1b888f4c-df57-52a9-9551-b2b692e929fa: endliche Tabellen/Graphen tragen Vermutungen; Begründungen des unendlichen Verhaltens beruhen auf dem Bildungsgesetz.

Beide Profile formulieren diese fachlichen Grenzen robust. Die Fingerprints der Review-Records wurden ausschließlich aus dem finalen kanonischen Zustand über den nativen Materialisierer erzeugt. Die Candidate-Datei enthält definitionsgemäß keine Fingerprints; die Records enthalten keine erfundenen Run-IDs. Native Write- und Verify-Prüfung bestätigten 20 aktuelle AI-Kandidaten. Beobachtete Bindungsnachprüfung: 2026-09-06T23:26:17Z.

## Inhaltliche Ausarbeitung

Vollständig gelesen: positive-understanding-evidence-profile-authoring-v2.md, Mathematik-Kriterien v2, Profil- und Config-Schema v2. Das vom Hauptagenten ausdrücklich erlaubte B038r-Config/Candidate-Beispiel wurde vollständig als Formatbeispiel gelesen, nicht als fachliche Entscheidungsvorlage. Die individuellen Erwartungen stammen aus der zuvor selbst vorgenommenen Prüfung exakt dieser 20 Ziele und ihres nativen Kontextes; 40 neue Aufgabenfälle und Lösungen wurden zielbezogen ausgearbeitet. Keine Keyword-Bulkentscheidungen oder bloßen Zahlentausch-Schablonen.

Ein einzelner reichhaltiger Erwartungskern pro Ziel hält die jeweilige atomare Kompetenz zusammen. Je zwei eigenständig zu bearbeitende Fälle prüfen diesen Kern mit einer echten Strukturvariation. Falltexte und Erwartungsleistungen sind DE/EN gleichwertig. Erwartungsleistungen beschreiben hypothetisch sichtbare Arbeit, keine bereits erbrachte Leistung.

Scope-Grenzen: Strukturziel 1341 plant Regeln ohne vollständige Ableitungsrechnung. Regelprüfung 864f unterscheidet Beispielkontrolle und allgemeinen Beweis. 51e8 verlangt keine komplexen Nullstellen. 70a2 vergleicht Näherungen, Aufwand und Anwendbarkeit statt universelle Ranglisten. 1b88 verlangt keinen formalen Epsilon-Beweis. 6a66 bleibt bei expliziter Auswertung, 10ef bei gegebener Rekursion ohne Newton-Herleitung. b66d unterscheidet Konvergenzexistenz und Grenzwertbestimmung. 4d55 prüft Partialsummendarstellung, keine zusätzliche allgemeine Konvergenztheorie. 565f erlaubt jedes gültige Divergenzargument; die dyadische Gruppierung ist eine mögliche Hilfe, kein exklusiver Pflichtweg.

## Autor-Checks

Root-Gegenprüfung am 2026-09-06 nach vollständiger Lektüre aller 20 Profile und aller 40 DE/EN-Fälle: fachlich angenommen als AI-Kandidaten. Im expliziten Folgenfall `rational-index-domain` wurde eine konkrete Mehrdeutigkeit behoben: Die abgefragte Auswahltabelle enthält b_20 als fünften berechneten Wert; daher wird jetzt eindeutig nach dem fünften **Glied der Folge** (b_7) gefragt, nicht nach dem fünften Tabellenwert. Alle übrigen Fälle bleiben erhalten. Die anschließende native Materialisierung bindet diese lokale Korrektur; keine menschliche Abnahme oder beobachtete Lernendenleistung wird behauptet.

Die ausführbare .author-check.mjs prüft die Profile gegen das native V2-Profil-Teilschema sowie die Config gegen das native Config-Schema und berechnet die konkreten Zahlenbeispiele erneut. Sie schreibt keine Dateien. Endlich viele Rechenassertions sind weder Beweise allgemeiner Grenzwertaussagen noch pädagogische Wirksamkeits- oder Lernendenevidenz. Die allgemeinen Begründungen sind als mathematische Autorenargumente in den Lösungen ausformuliert.

Aufruf vom Repository-Root mit Node 20:
`node curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-039-function-combinations-equations-and-sequences-20-v1.author-check.mjs`
