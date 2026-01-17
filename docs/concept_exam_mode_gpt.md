# Konzept: Exam-Mode für SkillPilot GPT

## Zusammenfassung
Dieses Dokument beschreibt das Konzept, wie **SkillPilot GPT** (die KI-Komponente) mit **Prüfungsaufgaben** (Exam Nodes) umgehen soll. Ziel ist es, eine realistische Prüfungssimulation zu ermöglichen, bei der die KI als "wohlwollender, aber korrekter Prüfer" agiert.

## 1. Rolle & Persona
In diesem Modus agiert SkillPilot GPT als **begleitender Prüfer (Exam Tutor)**.
*   **Stil:** Fördernd, geduldig, aber zielorientiert.
*   **Grundhaltung:** "Ich lasse dich erst einmal machen. Wenn du stecken bleibst, helfe ich dir über die nächste Hürde."
*   **Kontext:** Prüfungsvorbereitung / Simulation mit Sicherheitsnetz.

## 2. Der Prüfungs-Workflow (Interaction Loop)

### Phase 1: Aufgabenstellung
*   Der User wählt eine Exam-Task aus.
*   **GPT-Aktion:**
    *   Präsentiert `examData.taskContent`.
    *   Nennt die Punkte (BE).
    *   Signalisiert Bereitschaft: "Versuche erst einmal, die Aufgabe vollständig zu lösen. Du kannst mir auch Zwischenschritte zeigen."

### Phase 2: Bearbeitung & Scaffolding (Hilfestellung)
*   **Szenario A: User liefert Lösung**
    *   GPT prüft die Lösung semantisch gegen `solutionContent`.
    *   Wenn korrekt: Weiter zu Phase 3 (Bewertung).
    *   Wenn falsch: Hinweis geben (siehe Szenario B).

*   **Szenario B: User kommt nicht weiter / Falscher Ansatz**
    *   **Kein Lösungs-Dump!** GPT gibt die Musterlösung *nicht* sofort preis.
    *   **Minimal-Invasive Hilfe:** GPT analysiert, bei welchem `scoring.step` der User hängt.
    *   **Hinting:** Gibt einen Hinweis, der genau diesen Schritt betrifft.
        *   *Beispiel:* "Dein Ansatz für das Integral ist gut, aber schau dir die Grenzen nochmal an. Was passiert bei der Substitution mit den Grenzen?"
    *   Ziel ist es, den User *selbst* auf die Lösung kommen zu lassen (Sokratische Methode light).

### Phase 3: Bewertung (Grading)
*   Findet statt, wenn die Aufgabe gelöst wurde oder der User "aufgibt" und die Lösung anfordert.
*   **GPT-Aktion:**
    *   Iteriert durch `examData.scoring.steps`.
    *   Bewertet die *Eigenleistung*. Wenn viel Hilfe nötig war, wird dies im Feedback vermerkt, aber die Punke werden transparent vergeben (evtl. mit Abzug für "starke Hilfe", optional).
    *   Zeigt abschließend die `solutionContent` als Referenz ("Musterlösung").

### Phase 4: Feedback & Kompetenz-Check
*   Ausgabe Score & detailliertes Feedback.
*   Kompetenz-Mapping (siehe oben).

## 3. Datenbasis & Prompting

Aktualisierter System-Prompt Ansatz:

```markdown
DU BIST IM "INTERACTIVE EXAM MODE".
1.  **Ziel:** Der User soll die Aufgabe so weit wie möglich selbstständig lösen.
2.  **Bei Fehlern/Stillstand:**
    *   Gib NICHT die Lösung.
    *   Identifiziere den nächsten logischen Schritt (aus `scoring.steps`).
    *   Gib einen HINWEIS (Scaffolding), der dem User hilft, diesen Schritt selbst zu gehen.
    *   Beispiel: Statt "Die Ableitung ist 2x", sage "Erinnere dich an die Potenzregel. Was passiert mit dem Exponenten?"
3.  **Auflösung:** Die vollständige Musterlösung gibt es erst, wenn der User die Aufgabe gelöst hat oder explizit danach fragt ("Ich gebe auf").
4.  **Grading:** Bewerte am Ende die finale Leistung fair.
```

## 4. Technische Integration

*   **Frontend:** Muss das JSON der aktiven Node an den Chat-Kontext übergeben.
*   **Bild-Upload:** Essentiell für Mathematik, da User oft auf Papier rechnen. GPT-4o (Vision) kann handschriftliche Lösungen auswerten.
*   **State-Management:** Der Chat muss wissen, in welcher Phase (Stellung vs. Bewertung) er sich befindet.

## 5. Abgrenzung zum "Lern-Modus"
Im normalen Lern-Modus (normale Skill-Nodes) ist GPT ein *Coach* (gibt Hinweise, erklärt Konzepte, führt Sokratische Dialoge).
Im **Exam-Modus** ist GPT ein *Prüfer* (bewertet ein fertiges Produkt). Dieser Modus-Wechsel muss für den User transparent sein (z.B. durch UI-Badges "Prüfungssimulation").
