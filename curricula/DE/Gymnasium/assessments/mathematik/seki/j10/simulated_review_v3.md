# Fokussierter AI-Assessmentreview: Wartungsdrohne und Wassertank v3

Status: `approved_for_local_correction_candidate`. Die geprüfte lokale Korrektur von Bewegungsdeutung, Einheiten, Trägergeradenbezug und Quellenfassung ist fachlich geeignet zur Übernahme. Der Dateiname `simulated_review_v3.md` bezeichnet einen tatsächlichen AI-Review dieser konkreten Dateien, keine menschliche Abnahme und keine bereits vollzogene kanonische Übernahme.

Reviewer: OpenAI Codex, GPT-6, Agent `/root/math_b033a_blind_a`; genauer Modellsnapshot im Lauf nicht offengelegt. Tatsächlicher separater AI-Assessmentreview am 2026-09-06, erster Quellenabgleich um 05:24:41 UTC und abschließender Abgleich um 05:27:35 UTC. Der abgeschlossene unabhängige Beschreibungsreview A bleibt unverändert; dieser Assessmentreview ist kein Blindreview.

## Prüfgegenstand und Bindung

Ziel: `ea664a30-98be-508e-90ac-5304679814ee` – „Aufgabe 5 (Jahrgangsstufe 10, 10 BE)“.

Vollständig gelesen wurden die beiden unten gebundenen Dateien, die zugehörigen `after`-Texte des Adoptionkandidaten, die bestehenden kanonischen `examData` dieses Ziels und die dokumentierte Vorarbeit `assessment-corrections-symmetry-motion-v1.md`. Die neuen Dateien enthalten jeweils exakt den vorgeschlagenen Aufgaben- beziehungsweise Lösungstext. Die kanonischen Aufgaben- und Lösungstexte stimmten beim Abgleich exakt mit den `before`-Feldern überein.

| Geprüfte Datei, Pfade relativ zum Repository | SHA-256 der vollständigen Datei |
| --- | --- |
| `curricula/DE/Gymnasium/assessments/mathematik/seki/j10/draft_v3.md` | `1dacf435149490f65fb3eda53f485c62ecdb61b963025b115532852f78d37019` |
| `curricula/DE/Gymnasium/assessments/mathematik/seki/j10/solution_v3.md` | `bdadfc48d1f1dc0f0a57cdacab21c009ec5c0da40e46e8bc14eba9820d99156c` |

Beide Dateien enthalten ausschließlich die neue Fassung von Aufgabe 5 samt Kontext beziehungsweise Bewertung, keine anderen J10-Aufgaben. Der Anker `task-5` existiert. Die vorgeschlagene Quellenidentität ist `curricula/DE/Gymnasium/assessments/mathematik/seki/j10/draft_v3.md#task-5`. Der gelesene Kanon verweist bei `sourceRef` und `examData.sourceArtifactPath` noch auf `draft_v1.md`; bei Adoption müssen beide Verweise gemeinsam auf die tatsächlich geprüfte neue Aufgabenquelle wechseln.

Der gelesene Adoptionkandidat ist `curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-033-atlas-next-unreviewed-disjoint-20-v1/assessment-adoption-candidate-v1.json`, Dateihash `sha256:1a5d140b6db1397db355009626234e42496bf1dc9f37ab7910a730bd4a70e5e3`. Der Hash der gelesenen `examData`, berechnet aus `JSON.stringify(examData)` in ihrer vorhandenen Feldreihenfolge, lautet `sha256:1581ec231c14f28c75c55e561dd504f9cd9f83990b3a1b69f7f6d97a790d7fc4`. Diese Aufnahmebelege dokumentieren den Zustand vor Übernahme; die obigen Quellenhashes binden die fachlich geprüften Dateien.

## Fachliche Ergebnisse

1. Die Aufgabe legt den Zeitparameter in Sekunden, alle Ortskoordinaten in Metern und `t=0` als gewählten Referenzzeitpunkt fest. Dadurch bezeichnet `(1|2|0)` einen Ort zu diesem Zeitpunkt und `(2|1|1)` die konstante Ortsänderung je Sekunde. Die Lösung benennt folgerichtig den Geschwindigkeitsvektor `(2|1|1) m/s`. Sie verwechselt ihn nicht mit dem skalaren Geschwindigkeitsbetrag; dessen Wert wäre `√6 m/s`, wird hier aber nicht zusätzlich verlangt. „Nach zwei Sekunden“ ist mit Bezug auf den genannten Referenzzeitpunkt eindeutig. Die Rechnung `r(2)=(5|4|2)` und die Einheit Meter sind korrekt.
2. Für die Lagevergleiche wird ausdrücklich die gesamte Trägergerade betrachtet. Damit wird der geometrische Parameterbereich nicht stillschweigend auf einen Bewegungsstrahl `t≥0` verengt. Die Parameter `u` und `v` der Vergleichsgeraden sind geometrische Parameter, keine zusätzlich behaupteten Zeitvariablen. Die in Zahlwerten angegebene Ortsdarstellung ist mit den erklärten Meter- und Sekundenbezügen konsistent; die geometrische Verlängerung wird nicht als reale Fluggeschichte behauptet.
3. Beim Schnitt mit `s` liefert die dritte Koordinate `t=2`; die erste und zweite liefern übereinstimmend `u=0`. Der Schnittpunkt `(5|4|2)` stimmt. Für den Vergleich mit `k` sind die Richtungsvektoren gleich, während der Verbindungsvektor der Stützpunkte `(1|2|−1)` kein Vielfaches von `(2|1|1)` ist. Die Geraden sind deshalb echt parallel und nicht identisch. Beide Argumente verwenden alle notwendigen Bedingungen.
4. Für den geraden Kreiskegel ergibt sich `V=(1/3)π·2,4²·6=11,52π m³≈36,2 m³`. Rechenweg, Rundung und Volumeneinheit stimmen. Die Plausibilisierung über Pyramiden mit immer mehr Ecken der Grundfläche ist als kurze Grenzfallargumentation vertretbar: Gemeint ist eine Folge von Grundpolygonen, die die Kreisscheibe annähern, bei festgehaltener Höhe; aus `V=(1/3)G·h` und `G→πr²` folgt die Kegelformel. Die Aufgabe verlangt ausdrücklich Plausibilisierung und keinen formalen Konvergenzbeweis. Diese Deutung erläutert die vorhandene Lösung und erweitert den Aufgabenanspruch nicht.

## Bewertung

Die Punktverteilung bleibt `2+3+2+3=10 BE`, die Bestehensgrenze 5. Teil 1 verteilt 1 BE auf Anfangsort und Geschwindigkeit sowie 1 BE auf die Position nach zwei Sekunden. Diese knappe Verteilung passt zu der einfachen linearen Ortsänderung; für den ersten Punkt gehören die Einheiten und die Bedeutung je Sekunde zur richtigen Deutung. Ein Betrag der Geschwindigkeit ist keine zusätzliche Bedingung für volle Punkte.

Die übrigen Teile behalten ihren vorhandenen Anspruch und ihre BE: 3 für den konsistenten Schnittnachweis, 2 für Parallelität mit Ausschluss der Identität und 3 für Kegelvolumen samt Plausibilisierung. Die bestehende kanonische Gesamtbewertung besitzt weiterhin nur einen 10-Punkte-Schritt. Dessen Bezeichner `j10_released_v1_5` ist ein historischer Versionsbezeichner, kein Beleg für die Herkunft der v3-Prüfung. Bei Adoption ist seine Versionierung bewusst mit der tatsächlichen neuen Quellen- und Reviewprovenienz abzugleichen; Punktwerte müssen dafür nicht geändert werden. Dieser Review legt keine neue technische Schritt-ID fest und enthält keine empirische Schwierigkeitskalibrierung.

## Reichweite und offene Provenienz

Der bestehende Kanon enthält fünf `coveredGoalIds` und dieselben fünf Voraussetzungen. Dieser fokussierte Review prüft die lokalen Änderungen und die vollständigen Aufgabenrechnungen, jedoch keine erneute normative oder vollständige semantische Validierung aller fünf Zuordnungen, aller Schulstufenprojektionen oder des gesamten J10-Assessments. Er erteilt insbesondere keine Gesamtfreigabe der separat dokumentierten historischen E-Phasen-Coverage; die dort benannten Lücken bleiben offen.

Das vorhandene `reviewStatus=released` und die Notiz „released after simulated internal review on 2026-06-28 for J10“ beschreiben den alten kanonischen Zustand. Sie belegen weder eine menschliche Prüfung noch einen Review der neuen v3-Bytes. Die neue Fassung ist in eigenständigen Dateien vorhanden; dieser Reviewer hat ältere Quellen weder bearbeitet noch ihre gesamte Versionshistorie auditiert. Die spätere Adoption muss die neue Quelle und diesen tatsächlichen AI-Review ehrlich ausweisen.

Es gab keine Lernendendaten, keine Ausführung mit Lernenden und keine Prüfung von Laufzeitabläufen oder Visualisierungen. Der Reviewer hat ausschließlich diesen neuen Bericht geschrieben und keine Quellen, kanonischen Daten, Profile oder früheren Reviews geändert. Es wurden nur die genannten Texte abgeglichen, die Mathematik nachvollzogen und einzelne Rechenwerte lokal nachgerechnet; keine breite Testsuite oder Builds wurden ausgeführt.
