# Kurze Abschlussaufgaben für Impuls und mittlere Kraft

Diese Akte folgt den Eigentümerentscheidungen vom 25. November 2026, 17:50 und 18:25 CET. Es handelt sich um eigene SkillPilot-Aufgaben mit eng begrenzten Sichtangeboten, ohne Behauptung amtlicher Prüfungsaufgaben. Jede Aufgabe hat nur ihr tatsächlich geprüftes Ziel als direkte Voraussetzung und als `coveredGoalIds`-Eintrag. Die Aufgaben, Lösungen und Kalibrierungsarbeiten sind eigenes Wissensmaterial unter der in `LICENSING.md` festgelegten CC-BY-4.0-Zuordnung; technische Prüfprotokolle und Hilfsschemata folgen der dortigen technischen Zuordnung.

| Aufgabe | Tatsächlicher Abschluss | Letzte Fassung | Unabhängige Urteile |
|---|---|---|---|
| Gesamtimpuls zweier Wagen, IMP | **Geparkt, nicht freigegeben** | 12 BE, bestanden ab 10 | Beide `needs_change` |
| Mittlere resultierende Kraft, RATE-M | **Angenommen; eigenes Angebot nur für BW** | 10 BE, bestanden ab 8 | Beide `accept_current` |

Jede Aufgabe durchlief drei echte Autorenfassungen mit jeweils zwei separaten blinden Markierungen. Die beiden Markierungen erhielten unterschiedliche Reihenfolgen und undurchsichtige Arbeitskennungen; die Erwartungswerte des Autors und die jeweils andere Markierung waren nicht Teil ihrer Eingabe. Die tatsächlichen Modelle waren `gpt-6.1-sol` und `gpt-6.2-astra`, jeweils mit `ultra`. Die vollständigen strukturierten Eingaben und unveränderten Antworten sowie aus den echten CLI-Sitzungen abgeleitete Ausführungsbelege liegen bei jeder Fassung. Rohe CLI-, Sitzungs- und Fehlerprotokolle bleiben außerhalb des Repositories. Eine technische Unterbrechung des Gesamtimpuls-Autors vor jeder finalen Ausgabe wurde im selben Autoren-Thread mit unveränderten Eingaben fortgesetzt und ausdrücklich dokumentiert; das ist keine vierte Rubrikfassung.

## Angenommene Aufgabe zur mittleren Kraft

Der [Inhaltsentscheid](b50e9903-58b3-520d-96bf-d5bc1fe51ebf/content-review.actual.json) bindet den exakten Katalogkandidaten, deutsche und englische Aufgaben- und Lösungstexte, die Quelle und die nativen Aufgaben-/Rubrikrevisionen. Beide unabhängigen Markierungen beurteilten jeweils 39 synthetische Arbeiten. Alle Punktesummen und Bestehensentscheidungen stimmen überein. Die früheren Fehlbestehen bei fehlender Zahlenanwendung, falscher Kraftrichtungsdeutung und ausdrücklicher unbegründeter Gleichsetzung des Mittelwerts mit einer konstanten oder bestimmten momentanen Kraft liegen nun unter der Grenze. Ein einzelner nachgewiesen kleiner formaler Fehler kann weiterhin bestehen; eine zusätzliche Momentankraftberechnung wird nicht verlangt.

Die [Angebotsbindung](offer-bindings.actual.json) belegt ausschließlich die drei tatsächlichen BW-Angebote: CrossStage GK/LK und den neutralen Sek-I-Auszug. Alle 25 fachlichen Bedarfsatome liegen in der vorher bestehenden unteren Lernbasis; fehlende und nicht exponierte Bedarfe sind jeweils null. Die vorherigen 75.670 Referenzen in allen 90 Physiksichten behalten Inhalt, Ort und relative Reihenfolge. Der gemeinsame native CQR-104-Lauf über 106 Prüfkontexte bleibt wegen der sechs HH-/TH-IMP-Lücken **rot**; die begrenzte BW-Freigabe ist keine Gesamtfreigabe von H.

## Geparkte Aufgabe zum Gesamtimpuls

Der [begrenzte Abschlussbericht](d8fc6295-d0db-59e5-bd90-080bbc508c3a/bounded-outcome.actual.json) hält beide letzten Urteile und sämtliche 34 benoteten Arbeiten fest. Es gibt keine Abweichung zwischen ihren Kriterienwerten, Summen oder Bestehensentscheidungen. Beide markieren die Arbeit C32 unter der unveränderten Rubrik korrekt mit 12/12, lehnen aber genau diese Rubrikregel ab: Sie ignoriert die ausdrücklich aufrechterhaltene falsche Behauptung, Gesamtimpuls null bedeute stets ruhende Einzelkörper, obwohl diese Aussage der geprüften Auslöschung widerspricht. Das zweite Urteil nennt zusätzlich den noch zu geringen Verlust bei einem substanziell falschen Einzelkörper-Eingangswert trotz rechnerisch richtigem Weiterführen.

Eine vierte Fassung wurde nicht erstellt. Die Aufgabe steht weder im aktiven Katalog noch in einer aktiven Sicht; eine Lernenden-Datei oder ein angenommener Inhaltsentscheid wurde nicht erzeugt. Die IMP-Ziele in Hamburg und Thüringen bleiben sichtbar, und ihre sechs konfigurierten Abschlussrouten bleiben offen. Eine spätere Entscheidung des Eigentümers muss die weitere Bearbeitung begrenzen; weder Ziele noch Voraussetzungen, Bestehensentscheidung oder Qualitätsgrenzen wurden zur Umgehung geändert.

## Pfeilkriterium und Beweisgrenzen

Beide Aufgaben und ihre Lösungen verwenden vorzeichenbehaftete eindimensionale Zahlenwerte. Sie zeigen und verlangen keine am Körper eingezeichneten Kraft-, Geschwindigkeits- oder Impulspfeile. Körperanker, eigener Pfeilmaßstab, räumliche Endpunkte und räumlicher Summenpfeil sind deshalb jeweils **nicht anwendbar**. Ein optionales Wort oder ein Achsenrichtungspfeil zur Wahl der positiven Koordinate ist kein Körperpfeil. Hierfür wurde keine zusätzliche wissenschaftliche Markierungsrunde gestartet.

Der [neun Sichtangebote enthaltende Eingangsdatensatz](inputs/README.md) ist ausdrücklich historischer Autorenkontext und keine aktuelle Angebotsliste. Alle Arbeiten sind synthetische Rubrikproben. Sie belegen weder Ergebnisse wirklicher Lernender noch erteilte Lernzielbeherrschung, menschliche Abnahme, externe Veröffentlichung, vollständige CI oder eine abgeschlossene Integration auf `main`.
