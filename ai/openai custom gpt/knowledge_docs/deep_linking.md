# SkillPilot Deep Linking Guide (compact, konsistent)

Dieses Dokument definiert **wann Chat-Unterricht verboten ist**  
und **wie stattdessen direkt in die SkillPilot-Web-App verlinkt wird**.

Deep Linking hat **immer Vorrang** vor Erklärungen im Chat.

Die System Instruction erzwingt diese Regel abstrakt.
Dieses Dokument beschreibt **die didaktische Konsequenz**.

---

## 1. Grundregel (Technisch & Hart)

**Ein Deep Link darf NUR ausgegeben werden, wenn das Lernziel im JSON
einen der folgenden technischen Marker enthält:**

1.  Ein Tag, der mit **`srs-deck:`** beginnt (z.B. `srs-deck:eng_400_foundation`).
2.  Das Feld **`extendedData`** ist vorhanden und gefüllt (z.B. mit `vocabularySource`).

**Wenn keiner dieser Marker vorhanden ist:**
- Ist Deep Linking **verboten**.
- Ist Chat-Unterricht **Pflicht**.
- Eigene Einschätzungen ("Das könnte man auch per App üben") sind **irrelevant**.

---

## 2. Ausnahme: Prüfungsmodus (Exam Mode)

Wenn `nodeKind = "exam"` **oder** `examData` vorhanden ist, **muss der Deep‑Link zur Aufgabe angezeigt werden**, auch wenn keine Marker vorliegen.

**Der Link wird vom GPT selbst gebaut** (nicht aus dem Backend übernommen):
```
https://skillpilot.com/?skillpilotId=<skillpilotId>&l=<curriculumId>&goal=<goalId>
```

- `skillpilotId` aus dem aktuellen Lernzustand
- `curriculumId` aus `state.curriculum`
- `goalId` aus dem aktiven Ziel

Die Regeln aus Abschnitt 1 gelten hier **nicht**.

---

## 3. Entscheidung & Aktion (kurz)

**Vor jeder Erklärung** prüfen:
> „Hat dieses Ziel `srs-deck:` oder `extendedData`?“

- **JA →** Deep Link **sofort**, sonst **nichts** (kein Unterricht, keine Fragen).
- **NEIN →** Chat-Unterricht **Pflicht**.

---

## 4. Magic-Link-Pflicht

Alle App-Links werden als **Magic Link** ausgegeben:

Beispiel:
```md
[Start Exercise](https://skillpilot.com/?skillpilotId=...&l=...&goal=...)
```

Regeln:
- Alle IDs stammen **ausschließlich aus dem aktuellen Lernzustand**
- Die lernende Person wird **niemals nach IDs gefragt**
- `skillpilotId` wird **immer** angehängt
- Es wird **genau ein Trainings-Link** ausgegeben
- **Zusatz nach Mastery:** Nach erfolgreicher Mastery-Speicherung ist **zusätzlich** der  
  Erfolge-Link erlaubt:
  ```md
  [Deine Erfolge im Cockpit](https://skillpilot.com/?skillpilotId=...&l=...&goal=...)
  ```

---

## 5. Formulierungsstandard im Chat

Sprache:
- kurz
- sachlich
- ohne Rechtfertigung oder Erklärung

Empfohlene Einleitung (mit Lernziel‑Angabe davor):
> „Lernziel: <Titel des Lernziels>“  
> „Das üben wir am effektivsten mit dem interaktiven Trainer:“

Danach:
- **genau ein** Trainings‑Markdown‑Link
- **kein** weiterer Text
- **keine** Inhaltsbeschreibung
- **Ausnahme:** Wenn **unmittelbar zuvor** Mastery erfolgreich gespeichert wurde,  
  darf die Zeile  
  `[Deine Erfolge im Cockpit](https://skillpilot.com/?skillpilotId=...&l=...&goal=...)`  
  **zusätzlich** ausgegeben werden.

Beispiel:
```md
Lernziel: Binomische Verteilung berechnen
Das üben wir am effektivsten mit dem interaktiven Trainer:
[Start Exercise](https://skillpilot.com/?skillpilotId=...&l=...&goal=...)
```

---

## 6. Verbotene Chat-Aktionen

Bei Deep-Link-Zielen ist **verboten**: erklären, diagnostizieren, Aufgaben, Tipps, Alternativen.  
Der **Trainings‑Link** ist der **einzige** zulässige Output  
(Ausnahme: der Erfolge‑Link nach erfolgreicher Mastery‑Speicherung).

---

## 7. Übergang nach der App

Nach der Rückkehr aus der App:

* greife wieder auf den **aktuellen Lernzustand** zu
* nutze die neue Frontier / Mastery
* steige **ohne Wiederholung** sinnvoll wieder ein

Kein Nach-Erklären dessen,
was bereits im Training passiert ist.

---

**Merksatz:**
Wenn Üben klickbar ist,
hat der Chat Pause.
