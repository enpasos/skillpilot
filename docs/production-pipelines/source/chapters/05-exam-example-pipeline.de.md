## Klausurbeispiel-Produktionspipeline {#sec:pp-exam-example}

Dieses Kapitel definiert die allgemeine, wiederholbare Blaupause zur Erstellung qualitätsgesicherter Klausur- und Abitur-Beispielpakete aus amtlichen Prüfungsvorgaben, bevor diese stabilisierten Pakete als `examData` in den Skill-Graph übernommen werden (@ref{sec:pp-skill-graph}).

### Verzeichnisstruktur und Blueprint-Schema {#sec:pp-exam-layout}

Fachübergreifende Steuerdateien liegen unter `curricula/<...>/abi/<Subject>/` (`exam-example-authoring-guide.md`, `input/references.md`, `*_exam_blueprint*.json`); jedes Beispielpaket erhält einen eigenen Ordner wie `Klausurbeispiel2026_1/`:

```text
curricula/<...>/abi/<Subject>/Klausurbeispiel2026_1/
  checkliste.md
  <Subject>_<Region>_<Year>_Klausurbeispiel_<n>.md
  <Subject>_<Region>_<Year>_Klausurbeispiel_<n>_Musterloesung.md
  Schritt5_Abschluss_QS.md
  findings.md
  Schritt7_Finding_Bearbeitung.md
  Schritt8_ReQS.md
```

Temporäre Ähnlichkeits- oder Originalitätsberichte gehören ausschließlich unter `tmp/`. Der Planungs-Blueprint hält Abdeckung, Auswahlregeln und Komplementarität zu früheren Beispielen vorab fest:

```json
{
  "examSpecId": "subject-region-year-example",
  "locale": "de-DE",
  "subject": "Physik",
  "frameworkRefs": ["Official exam hint", "Curriculum"],
  "selectionModes": {},
  "contentFocus": {},
  "proposalMatrix": [],
  "globalCoverageChecks": []
}
```

### Zehnstufiger Workflow (Schritt 0 bis Schritt 9) {#sec:pp-exam-steps}

1. **Schritt 0 (Quellen registrieren):** Erlasse, Kerncurricula, Stilkorpora und frühere SkillPilot-Beispiele in `input/references.md` erfassen und amtliche Rechtsquellen strikt von Stilreferenzen trennen.
2. **Schritt 1 (QA-Checkliste anlegen):** Prüfbare Kriterien für Formalia, Auswahlmodus, Themenabdeckung, Anforderungsniveau, Originalität, Hilfsmittel und Konsistenz zwischen Aufgabe, Lösung und Bewertung definieren (`checkliste.md`).
3. **Schritt 2 (Blueprint entwerfen):** `GK`/`LK`-Varianten, Auswahlregeln, Teilaufgaben-Matrix und Komplementarität/Originalität gegenüber bestehenden Beispielen planen.
4. **Schritt 3 (Aufgabenblatt verfassen):** Eigenständige, nicht kopierte Aufgaben mit realistischem Kontext, sauberer Operatorensprache, konsistenten Einheiten/Daten und rein lernendenseitiger Formulierung erstellen.
5. **Schritt 4 (Musterlösung & Bewertung erstellen):** Vollständigen Lösungsweg je Teilaufgabe, transparente `BE`-Zuordnung, Begründungen sowie Rundungs-/Toleranzregeln dokumentieren.
6. **Schritt 5 (Abschluss-QS durchführen):** Punkt-für-Punkt-Bewertung gegen die Checkliste samt Restrisiken und Status (`draft-ready`, `release candidate`) in `Schritt5_Abschluss_QS.md` festhalten.
7. **Schritt 6 (Findings erfassen):** Review-Rückmeldungen strukturiert in `findings.md` aufnehmen (ID, Quelle, Beschreibung, Priorität, betroffene Dateien, Akzeptanzkriterium, Status).
8. **Schritt 7 (Findings abarbeiten):** Umgesetzte Änderungen, Ort, Begründung, Ähnlichkeits-/Originalitätsprüfungen und Folgerisiken in `Schritt7_Finding_Bearbeitung.md` protokollieren.
9. **Schritt 8 (Re-QS nach Findings):** Status-Delta (`behoben`, `teilweise behoben`, `offen`), betroffene Checklistenpunkte und aktualisierten Releasestatus in `Schritt8_ReQS.md` bestätigen.
10. **Schritt 9 (Graph-Integration):** Erst nach inhaltlicher Stabilisierung neue Prüfungsknoten mit `examData.taskContent`, `examData.solutionContent` und `examData.scoring` in das Landschafts-JSON eintragen (`docs/concept/skill-graph/node-types.md`). Fachspezifische Guides (`exam-example-authoring-guide.md`) instanziieren diesen Prozess mit konkreten Quellen, Pfaden und aktivem Schritt, ohne den allgemeinen Workflow zu duplizieren.
