# Unabhängiges Review und erwartete Integration

Bitte die tatsächlichen DE/EN-Aufgaben, Lösungen, Einzelkriterien und PNGs
lesen. Die Autorenbewertung ist kein Ausgangsurteil. Dies ist ein inaktiver
Vorschlag; keine Prüfung erhält allein wegen vorhandener Dateien den Status
`released`. Ein Review muss seine eigene tatsächliche Sitzung, Eingaben,
Datei-Hashes, Berechnungen, Befunde und Entscheidung belegen. Die vorhandenen
historischen Reviews und der eingefrorene V9-Nachweis bleiben unverändert.

1. Prüfe am heutigen Zieltext und aktiven positiven Profil, ob jede Prüfung
   ihr eines Ziel wirklich zweimal verlangt. Untersuche besonders den
   Wechsel von Achsenrollen, Plateau versus Schnittpunkt, Zeitabstand versus
   Achsenausschnitt und Mengenverhältnis versus Anteil. Prüfe die Grenzen der
   nicht erhobenen negativen Skalen/Piktogrammflächen ausdrücklich; Beispiele
   des Profils sind nicht automatisch neue Pflicht-Lernziele.
2. Rechne die Lösungen unabhängig nach und öffne die Original-PNGs aus
   `asset-manifest.json`, außerdem die tatsächlichen 360/680-Pixel-Dateien.
   Beurteile Punktlage, lineare Teilung, Einheiten, Linienzuordnung, Skalenstart,
   erhaltene Werte, Lesbarkeit und die äquivalenten englischen Fassungen.
3. Versuche, ohne einen Fall oder ohne eine wesentliche Kompetenzdimension zu
   bestehen. Die Summen sind auf Kriterienebene so gewählt, dass das nicht
   geht; prüfe darüber hinaus, ob einzelne Kriterien durch bloß nachgesprochene
   Zahlen ohne geforderte Erklärung erschlichen werden könnten. Gültige
   andere Lösungswege, verbal präzise Darstellungsvorschläge und passende
   Tabellen sind erlaubt. Keine willkürliche Alles-oder-nichts-Wertung ergänzen.
4. Prüfe, ob die mitgegebenen Rechenbedeutungen den ungesicherten Vorwissensbedarf
   auffangen, ohne die geforderte Deutung vorwegzunehmen. Rechenunterstützung
   macht kein weiteres gewöhnliches Ziel zum abgedeckten Lernziel.
5. Beurteile die stabile Task-5-Korrektur: derselbe Algebra-Inhalt behält seine
   ID, seine beiden wirklichen Voraussetzungen und Abdeckungen; ausschließlich
   die falsche Diagramm-Voraussetzung und -Abdeckung entfallen. Eine
   Bewertungshistorie wird nicht in neue Diagramm-Ergebnisse umgedeutet.

Für die Integration nach erfolgreichen Reviews ist konkret zu erwarten:

- Vier neue `practiceAssessment`-Knoten und genau eine zusätzliche Kante je
  Knoten zu seinem direkt geprüften bestehenden Ziel. Alle gewöhnlichen
  Mathematik-Knoten und -Voraussetzungen bleiben in dieser ersten Lieferung
  bytegleich. Der J7-Ordner `811d6d09-130e-47b2-aba8-a5c401fe3251` erhält vier
  weitere Kinder (Gewicht 9 auf 13). Aufgabensatz-Zeit und dessen BE-Summe
  werden nicht um die neuen unabhängigen Endpunkte erweitert.
- Bei Task 5 nur `d668c22d-caeb-5e91-8980-721c931a2bcf` aus `requires` und
  `examData.coveredGoalIds` entfernen; Blueprint und das zugehörige
  Einmalskript gemeinsam korrigieren. Der vorgeschlagene Generator-Patch
  entfernt die falsche Kante bei Replay und ergänzt keinen alten
  Freigabevorbehalt. Das gesamte historische Skript nicht unbesehen auf den
  aktuellen Katalog anwenden; es trägt weitere historische Baselineannahmen.
- Die neuen Prüfungen erst nach tatsächlicher Freigabe aktivieren. Das
  vorhandene semantische Register erlaubt nur `authoritative`; deshalb
  enthält `semantic-release-proposal.json` bewusst kein gefälschtes
  Registerobjekt. Das native Fingerprint-Ergebnis in der Autorenprüfung ist
  Hilfsinformation. Die eigentliche semantische Prüfung und zulässige
  `decisionBasis` müssen aktuell belegt sein. `practiceAssessment` steigt um
  vier, `curricularAtomic` bleibt unverändert.
- Vorschlagsdateien und Original-Assets an die angegebenen Repository- und
  App-Pfade übernehmen. Nur `solutionContent` referenziert die beiden
  Lösungsdiagramme; normale Aufgabenfelder müssen lösungsfrei bleiben. Diese
  Trennung ist keine Behauptung, statische App-URLs seien authentifiziert.
- Bestehende Sicht-Teilbäume können die neuen Ordnerkinder automatisch
  übernehmen. Der tatsächliche native Vorher/Nachher-Vergleich steht im
  Autorenbericht. Falls ein Land explizite Blattlisten oder nicht verfügbare
  Zielprojektionen verwendet, ist deren korrekte Assessment-Platzierung
  aktuell zu beheben; eine Quellenzuordnung darf dafür nicht erfunden werden.
  Kanonischer Rohhash, Dauer-Sichten-Policy und tatsächlich betroffene
  Quell-/Projektionsbindungen müssen durch ihre bestehenden Werkzeuge
  erneuert und geprüft werden; kein globales Rebinding von alten Reviews.

Relevante bestehende Checks nach der Übernahme umfassen mindestens
`test:exam-markdown`, `test:math-checkpoint-exams`,
`test:canonical-math-sek1-reviewed-exam-routes`,
`test:composition-projection-roles`, `validate:composition-views`,
`check:math-duration-composition-views`, die harten Lernrouten und die aktuellen
Assessment-/Semantic-/Quellenprüfungen sowie die zentrale Qualitätsneuberechnung
mit unveränderten geschützten Untergrenzen. Welche aktuellen Kontextreviews
ein neuer Elterninhalt tatsächlich entwertet, bestimmen die vorhandenen nativen
Fingerprints und Validatoren; keine pauschale historische Behauptung genügt.

Die vorhandene Regression `testCompositionProjectionRoles.ts` mit einer
`d668c22d`-Voraussetzung gehört zu einer anderen echten Sek-II-Route und muss
erhalten bleiben. Neue gezielte Regressionen sollten die vier echten
Bildstimuli, beidsprachige Aufgabeneinbettung, genaue direkte Abdeckungen und
die rechnerischen Auslassungsgrenzen sichern. Die bestehende
`testMathCheckpointExamRelease.ts` bietet dafür bereits das Kriteriensummen-
Muster. Kein neuer allgemeiner Prüfrahmen ist nötig.

Abschluss bleibt eine integrierte Lieferung auf `main` mit anschließendem
frischem vollständig erfolgreichen CI-Lauf. Dieser Scratch-Entwurf und seine
lokalen technischen Prüfungen sind dafür Vorbereitung.
