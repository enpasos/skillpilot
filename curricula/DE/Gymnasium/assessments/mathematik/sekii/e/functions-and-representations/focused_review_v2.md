# Fokussierter AI-Assessmentreview: Funktionen und Darstellungen v2

Status: `approved_for_local_correction_candidate`. Die geprüfte lokale Aufgaben-, Lösungs- und Bewertungskorrektur ist fachlich geeignet zur Übernahme. Dies ist keine Gesamtfreigabe der historischen Coverage, keine menschliche Abnahme und keine bereits vollzogene kanonische Übernahme.

Reviewer: OpenAI Codex, GPT-6, Agent `/root/math_b033a_blind_a`; genauer Modellsnapshot im Lauf nicht offengelegt. Tatsächlicher separater AI-Assessmentreview am 2026-09-06, erster Quellenabgleich um 05:24:41 UTC und abschließender Abgleich um 05:27:35 UTC. Der zuvor abgeschlossene unabhängige Beschreibungsreview A wurde nicht verändert; dieser Assessmentreview ist kein Blindreview.

## Prüfgegenstand und Bindung

Ziel: `e7013f6e-6051-5c88-8b4b-e054dc8db4cc` – „Funktionen und Darstellungen analysieren“.

Vollständig gelesen wurden die beiden unten gebundenen Dateien, die zugehörigen `after`-Texte des Adoptionkandidaten, die bestehenden kanonischen `examData` dieses Ziels und die dokumentierte Vorarbeit `assessment-corrections-symmetry-motion-v1.md`. Aufgaben- und Lösungstext stehen jeweils exakt wie im Adoptionkandidaten in der neuen Quelldatei. Die kanonischen Aufgaben- und Lösungstexte stimmten beim Abgleich exakt mit dessen `before`-Feldern überein.

| Geprüfte Datei, Pfade relativ zum Repository | SHA-256 der vollständigen Datei |
| --- | --- |
| `curricula/DE/Gymnasium/assessments/mathematik/sekii/e/functions-and-representations/draft_v2.md` | `ecdf4ecf5a45ea188304cfeb975f9198d921b06fe57afaf00a29e57ef5aaeb9c` |
| `curricula/DE/Gymnasium/assessments/mathematik/sekii/e/functions-and-representations/solution_v2.md` | `4add8d6f6789c17371c46ff18134a94ac55a9ccdc43506e9d98da0a435226459` |

Der vorhandene Anker `task` trägt die vorgeschlagene Quellenidentität `curricula/DE/Gymnasium/assessments/mathematik/sekii/e/functions-and-representations/draft_v2.md#task`. Im gelesenen kanonischen Zustand fehlen noch `sourceRef` und `examData.sourceArtifactPath`; deren gemeinsame Übernahme auf die tatsächlich geprüfte v2-Quelle bleibt Aufgabe der Adoption.

Der gelesene Adoptionkandidat ist `curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-033-atlas-next-unreviewed-disjoint-20-v1/assessment-adoption-candidate-v1.json`, Dateihash `sha256:1a5d140b6db1397db355009626234e42496bf1dc9f37ab7910a730bd4a70e5e3`. Der Hash der gelesenen `examData`, berechnet aus `JSON.stringify(examData)` in ihrer vorhandenen Feldreihenfolge, lautet `sha256:4a474bc9cfde437069d77cefd7c0836c188eaccda5ed8637760e3ae705e2c53f`. Diese beiden Aufnahmebelege dokumentieren den Zustand vor Übernahme; die obigen Quellenhashes binden die fachlich geprüften Dateien.

## Fachliche Ergebnisse

1. Die vollständige Parabel ist ausdrücklich auf den reellen Zahlen definiert; der Modellgraph ist ihre Einschränkung auf `[0,9]`. Die Aufgabenstellung vermischt diese beiden Graphen nicht mehr. Die vollständige Definitionsmenge ist unter `x ↦ −x` invariant. Die Rechnung `f(−x)=−x²/2−4x+2` ist korrekt und liefert weder die Identität `f(−x)=f(x)` noch `f(−x)=−f(x)`. Die vollständige Parabel besitzt daher weder y-Achsen- noch Ursprungssymmetrie. Beim Modellgraphen reicht bereits die fehlende Invarianz seiner Definitionsmenge als Gegenargument. Damit wird der gezielt betroffene Symmetrienachweis tatsächlich verlangt und erläutert; das ist keine Aussage über vollständige individuelle Beherrschung nach nur einer Aufgabe.
2. Die Scheitelpunktform `f(x)=−(x−4)²/2+10`, die Achse `x=4` und der Scheitelpunkt `S(4|10)` stimmen. Die Spiegelung `x ↦ 8−x` führt `9` auf `−1`, also aus der Modell-Domäne heraus. Der eingeschränkte Graph behält den Scheitelpunkt, aber nicht die globale Achsensymmetrie der vollständigen Parabel. Ein bloß symmetrisch wirkender Ausschnitt ist kein Nachweis der Symmetrie des gesamten Modellgraphen.
3. Die Nullstellen `4 ± 2√5` und die positive Entfernung von etwa `8,47 m` sind korrekt. Die negative Nullstelle gehört nicht zum gewählten Fontänenkontext. Das ausdrücklich vorläufige Intervall `[0,9]` ist als Gegenstand einer Modellprüfung vertretbar: Teil 2 fordert die sinnvolle Grenze am Bodentreffer, und die Lösung benennt die danach negativen Höhen einschließlich `f(9)=−2,5`. Die negative Fortsetzung wird nicht als über dem Boden fliegender Wasserstrahl ausgegeben.
4. Für `f(x)>8` ergibt sich korrekt `(x−2)(x−6)<0`, also `2<x<6`. Die strengen Intervallgrenzen passen zu „höher als 8 m“. Aus `g(4)=6` folgt `m=1`; die momentane Änderungsrate der Parabel am Scheitel ist null. Die verglichene Rate ist Höhenänderung je waagerechter Entfernung, hier Meter je Meter, keine zeitliche Geschwindigkeit. Die Kurzlösung kann ohne Ableitungsrechnung durch die Scheiteltangente begründet werden; eine zusätzliche Differentiationsmethode wird nicht vorgeschrieben.

Die endgültig geprüfte Fassung verlangt in Teil 2 ausdrücklich die Flugbahn „bis einschließlich zum Bodentreffer“; dieselbe Formulierung steht in der Lösung. Damit passt das geschlossene Intervall `0≤x≤4+2√5` präzise zum Auftrag. Die davon verschiedene Aussage „streng oberhalb des Bodens“ würde `0≤x<4+2√5` verlangen. Der anfängliche Sprachhinweis ist durch die vor Adoption erneut vollständig gelesenen und oben neu gebundenen v2-Quelldateien erledigt. Zahlen, Rechenergebnisse und Punktwerte sind davon unberührt.

## Bewertung

Die bestehende Summe 20 Punkte und die Bestehensgrenze 10 bleiben erhalten; vier Teile zu je 5 Punkten stimmen mit den bestehenden kanonischen Bewertungswerten überein. Die vorgeschlagene neue Beschreibung von Schritt `e1` umfasst die tatsächlich ergänzten Symmetrie- und Definitionsmengenprüfungen. Die interne Verteilung 2 Punkte für y-/Ursprungssymmetrie der vollständigen Parabel, 2 für Achse/Scheitel und 1 für Definitionsmengen/Einschränkung ist für den fokussierten Ersatz vertretbar. Beim letzten Punkt sind die beiden unterschiedlichen Domänenargumente zu berücksichtigen; äquivalente Gegenbeispiele verdienen dieselbe Anerkennung.

Schritt `e2` bleibt mit der bestehenden Beschreibung „Nullstellen korrekt berechnet und im Kontext gedeutet“ vereinbar: Die sinnvolle Grenze am Bodentreffer ist hier Teil der Kontextdeutung. Teile 3 und 4 behalten ihren mathematischen Inhalt und ihre Punktwerte. Eine empirische Kalibrierung von Schwierigkeit, Bearbeitungszeit oder Bestehensgrenze wurde nicht vorgenommen.

## Offene historische Coverage und Reichweite

Der bestehende Kanon enthält 13 `coveredGoalIds` und dieselben 13 `requires`. Dieser Review bestätigt deren Gesamtumfang ausdrücklich nicht. Die in der Vorarbeit benannten Lücken bleiben durch die lokale Korrektur ungelöst:

| Historisch beanspruchtes Ziel | Weiterhin nicht eigens verlangt |
| --- | --- |
| `8fa32a68-46eb-414e-8292-a4c4052b2522` | Exponentialfunktion |
| `1801c759-d92d-5bfb-a44f-cfd2455d207b` | Funktionsgleichung aus einem vorgegebenen Graphen gewinnen |
| `0b47fec8-33ec-5f29-8d3e-64941a7c8ac5` | Verhalten im Unendlichen mit Grenzwertnotation |
| `56b4acb5-6024-573f-9890-35fbd21ee343` | Schnittwinkel |
| `71f62cfa-7cc2-5f60-9691-bcdc2ee910df` | Vielfachheit von Nullstellen und zugehöriges Graphenverhalten |

Die neue Aufgabe verbessert gezielt die bisher fehlende Prüfung von `d8c9eb57-1614-4c1d-829a-618134def352` und klärt die physikalische Modellgrenze. Historische Coverage beizubehalten wäre eine separat dokumentierte offene Altlast, kein Ergebnis dieses Reviews. Das vorhandene `reviewStatus=released` ist historische Metadatenlage und kein Beleg einer menschlichen Prüfung der v2-Fassung.

Es gab keine Lernendendaten, keine Ausführung mit Lernenden und keine Prüfung aller curricularen Zuordnungen, Laufzeitabläufe oder Visualisierungen. Der Reviewer hat ausschließlich diesen neuen Bericht geschrieben und keine kanonischen Daten, Quellen, Profile oder früheren Reviews geändert. Es wurden nur die genannten Texte abgeglichen, die Mathematik nachvollzogen und einzelne Rechenwerte lokal nachgerechnet; keine breite Testsuite oder Builds wurden ausgeführt.
