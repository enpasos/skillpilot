# K2, informierter Entwurf v2: fachliche Kernleistung entscheidet

Status: **inaktiv, `needs_review`**, 15. November 2026. V2 setzt das tatsächliche
unabhängige Review des eingefrorenen Erstentwurfs um. Es ändert keine kanonische
Datei und keine Laufzeit- oder Lernergebnissemantik. Der erste eingefrorene
Entwurf und dessen Review bleiben bytegleich erhalten.

Im bestehenden Laufzeitvertrag entscheidet allein
`earnedPoints >= passingPoints`. Die frühere Reserve von drei Punkten erlaubte
deshalb das Bestehen trotz falscher Kernunterscheidung. V2 bewertet die
fachlich wesentlichen Leistungen einzeln mit **0 / 1 / 2 Punkten** und setzt
die Bestehensgrenze auf die Summe dieser Kernpunkte. 2 bedeutet angemessene
sichtbare Leistung, keine perfekte Musterlösung. 1 hält eine erkennbare
Teil-Leistung als Rückmeldung fest. Es gibt weder zusätzliche kosmetische
Kompensationspunkte noch einen versteckten Bestehensvorbehalt.

| Prüfung | Kernkriterien | Maximum und Bestehen | Pflichtkern aus dem Befund |
| --- | ---: | ---: | --- |
| Achsen/Skalen | 5 | 10 | Kategorien von Größen unterscheiden; Zwischenwerte und Einheitenfaktor sinnvoll lesen. |
| Kennwerte/Trends | 8 | 16 | Maxima, Gleichstand und zeitbezogene Veränderung deuten; Zukunft und Ursache begründet vom Verlauf trennen. |
| Aussagenprüfung | 4 | 8 | Zahlenurteil und tatsächlichen Darstellungsmechanismus jeweils verbinden. |
| Erklärung/Korrektur | 6 | 12 | Fehlinterpretation korrigieren, geeignete Alternative konkretisieren und deren Vorteil am eigenen Vorschlag erklären. |

Die Fälle decken die bestehenden P-Erwartungen **gemeinsam** ab. Es werden
keine neuen Profilpflichten erfunden: keine negativen Temperaturskalen, keine
Piktogrammflächen, keine formale Intervallschreibweise und keine bestimmte
Diagrammart. Kennwerte und Interpretation werden an zwei verschieden
aufgebauten Verläufen sichtbar. Bei Korrekturen ist gerade die neue
Vergleichsbasis der Transferkern; daher sind sowohl eine geeignete zweite
Alternative als auch ihre verständliche Begründung nötig. Dafür sind alle
passenden Tabellen und andere gleichwertige Darstellungen zulässig.

Einheiten müssen eindeutig verständlich sein, aber nicht in jedem Halbsatz
wiederholt werden. Rechenwege, Quotientenschreibweise, zusätzliche
Subtraktionen, Prozentpunkte, explizite Endpunktwörter und Skizzenästhetik
sind keine selbständigen Bestehenshürden. Ein isolierter Schreib-/Rechenfehler
wird nicht als fehlendes Verständnis gewertet, wenn richtige Ablesung,
Bezugsbasis, Vorgehen und Schluss sonst eindeutig vorliegen und der Fehler
keine wesentliche Entscheidung trägt. Ein offener Widerspruch zu genau der
bewerteten Kernaussage verhindert dort volle Kernpunkte.

Die Aufgabenfelder in DE/EN, mathematischen Musterlösungsteile, vier stabilen
IDs, direkten Voraussetzungen, Abdeckungen, Anwendbarkeiten und Source-Locators
bleiben unverändert. Die Musterlösungsfelder erhalten ausschließlich die
allgemeine Bewertungsregel als Anhang. Die acht Diagramme und alle 16
mobilen Derivate sind bytegleich mit den bereits tatsächlich geöffneten und
unabhängig geprüften Dateien. Es werden keine neuen Bild- oder Hostprüfungen
behauptet.

Wichtige Dateien:

- `proposed/curricula/DE/Gymnasium/assessments/mathematik/seki/j7/diagram-route-repair-20261115-v1/assessment-definitions.json`: vier Kandidaten mit neuem Bewertungsraster; daneben lesbare DE/EN-Dateien.
- `essential-rubric-and-coverage.json`: zweisprachige 0/1/2-Anker, Fall- und P-Zuordnung sowie Bewertungsregel.
- `review-counterexamples-rescored.actual.json`: tatsächliche Autorenbewertung der konstruierten Gegenbeispiele R1–R4 aus dem Review, mit ausgerechneten Summen. Keine automatisierte semantische Bewertung und keine Lernendenantworten.
- `equivalent-positive-performances.actual.json`: vollständige, gleichwertige konstruierte Leistungen, darunter sprachliche Ratenvergleiche und Tabellen ohne vorgeschriebenen Diagrammtyp.
- `exact-change-inventory.actual.json`: exakte Feld- und Byte-Abgrenzung zu v1.
- `author-validation.actual.json`: aktuelle gezielte Autorenprüfung der Dateien, Pins, Punktesummen und mathematischen Struktur; keine vollständige Katalog-QA oder Remote-CI.
- `review-evidence-v1/`: unveränderte Kopien des tatsächlich erhaltenen unabhängigen Reviews und seiner Receipt-/Gegenbeispiel-Dateien.

Neu aufbauen: `python tmp/math-diagram-route-20261115/draft/v2/build_v2.py`.
Gezielt prüfen:
`app/node_modules/.bin/tsx tmp/math-diagram-route-20261115/draft/v2/validate_v2.mts`.
Beide Befehle schreiben nur unter diesem Scratch-Verzeichnis. Ein
eingefrorenes Review-Paket wird danach separat erzeugt und niemals durch den
Builder überschrieben.

Die Wiederverwendung desselben Wasserbildes beziehungsweise desselben
Säulenfalls zwischen verschiedenen Prüfungen ist keine Garantie neuer
Exposition. Bereits gesehene Lösungen und Wiederholungen werden durch diese
Metadaten nicht zu frischer Transferleistung umetikettiert. Dieses Paket hat
keinen Lernenden-Expositionsnachweis und ändert dafür keinen Vertrag.

Die unabhängig gerechtfertigte enge Task-5-Korrektur bleibt unverändert
vorgeschlagen. Die vier neuen Prüfungen benötigen die erneute unabhängige
Inhaltsentscheidung, danach die tatsächlichen aktuellen Integrationsgates
und das vereinbarte frische erfolgreiche CI auf `main`. Die geschützten
Qualitätsuntergrenzen und alle historischen Nachweise bleiben erhalten.
