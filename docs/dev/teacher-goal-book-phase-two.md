# Lernzielbuch und Zeitplanung: zweite Ausbaustufe

Stand: 5. September 2026. **Wiederaufnahmenotiz, keine laufende Umsetzung.**
Die zweite Ausbaustufe wird zurückgestellt und erst auf erneuten Auftrag begonnen.
Grundlage ist die [erste Ausbaustufe](../concept/skill-graph/teacher-goal-book-time-planning.md).

## Ziel und nächster Einstieg

Lehrkräfte sollen **Unterrichtseinheiten zusammenstellen und praktisch nutzen**
können. Zuerst zwei oder drei echte Unterrichtseinheiten mit Stufe 1 planen und
festhalten: Welche Zielauswahl fehlt? Was wird zur Unterrichtsvorbereitung oder
Fachkonferenz tatsächlich auf Papier gebraucht? Danach den folgenden Umfang
anhand dieser Beispiele bestätigen.

## Priorität 1: eigene Unterrichtseinheiten

- Mehrere kursgültige Lernziele zu einem benannten Bündel zusammenstellen,
  ergänzen oder herausnehmen und gemeinsam terminieren.
- Beispiel: „Lineare Funktionen – sechs Unterrichtsstunden“. Der Zeitbedarf
  ist eine Einschätzung der Lehrkraft, keine Berechnung aus der Zielanzahl.
- Das Bündel gehört ausschließlich zum lokalen Plan. Es erzeugt keinen neuen
  Curriculum-Cluster und verändert weder Lernziele noch deren Beziehungen.
- Ausgangspunkt: Ein Lernabschnitt verweist derzeit über `goalId` auf genau ein
  Ziel oder einen vorhandenen Cluster. Bei Wiederaufnahme die Erweiterung des
  bestehenden Planmodells und die Kompatibilität gespeicherter Pläne prüfen;
  kein paralleles Planmodell einführen.

## Priorität 2: druckbare Arbeitsunterlagen

Eine Unterrichtseinheit und eine kompakte Kursübersicht druckbar machen:
Zeitraum, Lernziele, nachvollziehbare Originalquellen, Voraussetzungen und Platz
für Notizen. Quellen sollen auch auf Papier auffindbar bleiben, etwa über Titel
und nummerierte Quellenangaben mit URL. Fehlende Nachweise kenntlich machen.

**Geplant**, **im Unterricht behandelt** und **individuell beherrscht** bleiben
getrennte Aussagen. Eine Planung oder Unterrichtsmarkierung setzt keine Mastery.

## Anschließend, nicht Teil dieser Ausbaustufe

Reale Unterrichtskapazität berücksichtigen: Wochenstunden, Ferien und Ausfälle
statt einer gleichmäßigen Montag-bis-Freitag-Verteilung. Das muss mit den
persönlichen Lernplänen konsistent sein; Zielzahlen sind kein Zeitmaß.
KI-generierte Zeitpläne bleiben vorerst zurückgestellt. Fachlicher Bezug:
[Zeitachsenkonzept](../concept/didactic/curriculum-time-axis-and-pacing.md).

## Leitplanken und Abnahme bei Wiederaufnahme

- Klasseninformationen und Unterrichtsbündel bleiben lokal; keine zentrale
  Klassenablage, auch kein verschlüsselter Server-Blob als stillschweigende
  Architekturänderung. Druck/PDF entsteht ohne externen Exportdienst.
- Die autoritative Kursprojektion begrenzt die Zielauswahl. Persönliche
  Lernpläne ändern sich nur über die bestehende ausdrückliche Übernahme.
- Curriculum-Updates ändern einen unveränderten Plan nicht stillschweigend;
  tatsächliche Zielkonflikte bleiben sichtbar.
- Die Beispiel-Einheiten müssen sich zusammenstellen, bearbeiten, speichern,
  wieder öffnen und lesbar drucken lassen. Bestehende Pläne bleiben nutzbar.
- Entwurfsschutz, Rücknavigation und Tastaturbedienung bleiben zuverlässig;
  fokussierte Modell-/UI-Regressionen sichern diese Abläufe ab.
- Vor Codeänderungen aktuellen Implementierungsstand und Review-Freeze prüfen.
  Diese Notiz erteilt keine Freigabe für Vertragsänderungen, Deployment oder
  einen neuen Curriculum-QS-Lauf.

Technischer Einstieg: `app/src/coursePlanTypes.ts`,
`app/src/components/CoursePlanPilotView.tsx`, `CoursePlanLearningBook.tsx`,
`CoursePlanTimeline.tsx` und `app/scripts/testTrainerCoursePlanUi.ts`.
