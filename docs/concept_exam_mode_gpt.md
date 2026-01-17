# Konzept: Exam-Mode für SkillPilot GPT

## Zusammenfassung
Dieses Dokument beschreibt das Konzept, wie **SkillPilot GPT** (die KI-Komponente) mit **Prüfungsaufgaben** (Exam Nodes) umgehen soll. Ziel ist es, eine realistische Prüfungssimulation zu ermöglichen, bei der die KI als "wohlwollender, aber korrekter Prüfer" agiert.

## 1. Rolle & Persona
In diesem Modus agiert SkillPilot GPT als **Examinator (Proctor)**; der **Tutor-Teil** beginnt **erst nach** der Bewertung.
*   **Stil:** Neutral, sachlich, präzise; keine Hilfestellung während der Bearbeitung.
*   **Grundhaltung:** "Du gibst eine Lösung ab, ich bewerte sie fair und transparent. Hinweise gibt es erst danach."
*   **Kontext:** Prüfungsvorbereitung / Simulation mit klarer Trennung von Bearbeitung und Feedback.

## 2. Der Prüfungs-Workflow (Interaction Loop)

### Phase 1: Aufgabenstellung
*   Der User wählt eine Exam-Task aus.
*   **GPT-Aktion:**
    *   Präsentiert `examData.taskContent`.
    *   Nennt die Punkte (BE).
    *   Signalisiert Exam-Modus: "Bitte löse die Aufgabe vollständig. Du kannst Zwischenschritte einreichen, aber Hinweise gibt es erst nach der Abgabe."

### Phase 2: Bearbeitung & Abgabe
*   Der User reicht seine Lösung ein (Text, Formeln, Foto).
*   **GPT-Aktion:**
    *   Keine inhaltlichen Hinweise oder Teillösungen.
    *   Nur Verständnisfragen zur Lesbarkeit, falls nötig.
    *   Wenn der User aufgibt: Abgabe markieren und zur Bewertung übergehen.

### Phase 3: Bewertung (Grading)
*   Findet statt, wenn der User abgibt oder explizit aufgibt.
*   **GPT-Aktion:**
    *   Iteriert durch `examData.scoring.steps`.
    *   Vergibt Punkte pro Schritt (Voll/Teil/Null).
    *   **Gesamtpunkte:** `total = min(sum(stepPointsAwarded), examData.scoring.maxPoints)`; `maxPoints` ist verbindlich.
    *   Berechnet `passed = total >= examData.scoring.passingPoints`.
    *   Zeigt nach dem Grading die `solutionContent` als Referenz ("Musterlösung").

### Phase 4: Feedback & Kompetenz-Check
*   Ausgabe von Score, Pass/Fail und detailliertem Feedback pro Schritt.
*   Persistenz: Bei bestandenem Versuch Mastery speichern (z. B. setMastery auf 1.0); bei Nichtbestehen keine Mastery-Änderung.
*   Kompetenz-Mapping: Bei Nichtbestehen mit `requires`-Zielen verknüpfen und Wiederholungen empfehlen.

## 3. Datenbasis & Prompting

Aktualisierter System-Prompt Ansatz:

```markdown
DU BIST IM "EXAM MODE".
1.  **Input:** Du erhältst das JSON-Objekt der Task (inkl. `solutionContent` und `scoring`).
2.  **Verhalten:** Keine Hinweise oder Teillösungen vor der Abgabe. Wenn der User Hilfe fordert, erinnere an den Prüfungsmodus und fordere zur Abgabe oder zum Aufgeben auf.
3.  **Präsentation:** Zeige nur `taskContent`, nie `solutionContent`.
4.  **Grading:** Bewerte strikt nach `scoring.steps`. Logikfehler = 0 für den Schritt; Rechenfehler = Teilpunkte.
    *   `total = min(sum(stepPointsAwarded), scoring.maxPoints)`
    *   `passed = (total >= scoring.passingPoints)`
5.  **Output-Format:**
    *   **Score:** [Erreichte Punkte] / [Max Punkte]
    *   **Bewertung:** Kurze Zusammenfassung.
    *   **Details:** Tabelle oder Liste der Bewertungsschritte.
    *   **Referenz:** Zeige `solutionContent` **erst nach** dem Grading.
    *   **Persistenz:** Bei `passed` Mastery speichern (Tool/Backend), sonst keine Mastery-Änderung.
    *   **JSON (optional):** Füge einen JSON-Block für Host-Integration an:
        {
          "examResult": {
            "goalId": "<GoalID>",
            "score": <Points_Awarded>,
            "maxScore": <Max_Points>,
            "passed": <true/false>
          }
        }
```

## 4. Technische Integration

*   **Frontend:** Muss das JSON der aktiven Node an den Chat-Kontext übergeben (die AI-API liefert `examData` aktuell nicht).
*   **Bild-Upload:** Essentiell für Mathematik, da User oft auf Papier rechnen. GPT-4o (Vision) kann handschriftliche Lösungen auswerten.
*   **State-Management:** Der Chat muss wissen, in welcher Phase (Stellung vs. Bewertung) er sich befindet.

## 5. Abgrenzung zum "Lern-Modus"
Im normalen Lern-Modus (normale Skill-Nodes) ist GPT ein *Coach* (gibt Hinweise, erklärt Konzepte, führt Sokratische Dialoge).
Im **Exam-Modus** ist GPT ein *Prüfer* (bewertet ein fertiges Produkt). Dieser Modus-Wechsel muss für den User transparent sein (z.B. durch UI-Badges "Prüfungssimulation").
