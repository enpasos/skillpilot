# Findings-Backlog - Klausurbeispiel 2026/2

Legende Status: `offen` | `in Bearbeitung` | `geschlossen`

| ID | Quelle | Beschreibung | Prioritaet | Betroffene Dateien | Akzeptanzkriterium | Status |
|---|---|---|---|---|---|---|
| F2-001 | Interne QS | Originalitaet gegen Klausurbeispiel 1 absichern (kein Copy-Paste von Kontexten/Loesungswegen). | hoch | `Physik_Hessen_2026_Klausurbeispiel_2.md`, `Physik_Hessen_2026_Klausurbeispiel_2_Musterloesung.md`, `tmp/physik_example2_similarity_report.*` | N-Gram- und Zeilenvergleich dokumentiert; lange direkte Uebereinstimmungen beschraenken sich auf generische Bewertungsgrundsaetze. | geschlossen |
| F2-002 | Interne QS | Didaktische Feinabstimmung durch Fachkollegium (Operatorik und BE-Schwerpunkt je Teilaufgabe). | mittel | `Physik_Hessen_2026_Klausurbeispiel_2.md`, `Physik_Hessen_2026_Klausurbeispiel_2_Musterloesung.md` | Mindestens eine externe Fachgegenlese mit Rueckmeldungen protokolliert. | offen |
| F2-003 | Prozess | Sonderfall LK_SfE (A + B1/B2/B3) optional als eigene Variante ausarbeiten. | niedrig | `Physik_Hessen_2026_Klausurbeispiel_2.md`, `abi_2026_physik_exam_blueprint_2.json` | Entweder explizit ausgearbeitet oder dokumentiert als bewusst verschoben. | offen |
| F2-004 | Prozess | Integration von Klausurbeispiel 2026/2 in die Landscape-Datei als neue Exam-Knoten (`examData`) vorbereiten. | mittel | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json` | Nach Freigabe der Inhalte existieren konsistente GK/LK-Knoten mit `taskContent`, `solutionContent`, `scoring`. | offen |
