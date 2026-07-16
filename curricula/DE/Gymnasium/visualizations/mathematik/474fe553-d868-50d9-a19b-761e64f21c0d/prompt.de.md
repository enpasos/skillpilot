# Lernzielvisualisierung: Kleinen Satz von Fermat beweisen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `474fe553-d868-50d9-a19b-761e64f21c0d`
- Titel: Kleinen Satz von Fermat beweisen (LK)
- Beschreibung: Die lernende Person kann den kleinen Satz von Fermat formulieren, beweisen und seine Aussage in modular-arithmetischen Beispielen deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `474fe553-d868-50d9-a19b-761e64f21c0d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/474fe553-d868-50d9-a19b-761e64f21c0d/474fe553-d868-50d9-a19b-761e64f21c0d.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Kleinen Satz von Fermat beweisen
Beschreibung: Die lernende Person kann den kleinen Satz von Fermat formulieren, beweisen und seine Aussage in modular-arithmetischen Beispielen deuten.

Zusatzanweisung:
Pflichtinhalt:
- Erstelle eine fachlich exakte, aufgeräumte Cartoon-Lernübersicht mit drei Bereichen: `Satz`, `Beweisidee` und `Beispiel`.
- Formuliere den Satz mit nur den Variablen `p` und `a`: `Ist p eine Primzahl und teilt p die Zahl a nicht, dann gilt a^(p−1) ≡ 1 (mod p).`
- Zeige in der Beweisidee die Nichtnullreste `1, 2, …, p−1`. Multiplikation mit `a` permutiert diese Reste modulo `p`.
- Zeige genau die Produktkongruenz `a^(p−1) · (p−1)! ≡ (p−1)! (mod p)`.
- Erkläre knapp: `Da p die Zahl (p−1)! nicht teilt, darf gekürzt werden.` Danach folgt `a^(p−1) ≡ 1 (mod p)`.
- Zeige als Beispiel ausschließlich `p = 5`, `a = 2`, die Restabbildung `1→2, 2→4, 3→1, 4→3` und `2⁴ = 16 ≡ 1 (mod 5)`.
- Ersetze im Beispiel das Kreisrad durch eine kleine, eindeutig lesbare Zweispaltentabelle. Überschriften: `x` und `2x mod 5`. Zeilen exakt: `1 | 2`, `2 | 4`, `3 | 1`, `4 | 3`. So ist jede der vier Abbildungen sichtbar und keine fehlt.
- Alle Variablen, Exponenten, Fakultäten, Kongruenzzeichen und Klammern müssen groß und eindeutig lesbar sein.

Vermeiden:
- Die Variable `d`; verwende durchgehend ausschließlich `a` als die zu potenzierende Zahl.
- Verstümmelte Teilbarkeitszeichen oder Aussagen wie `p teilt a`.
- Eine falsche rechte Produktseite, insbesondere `(p−2)!`, oder falsches Kürzen.
- Ein unvollständiges Kreisrad oder eine Restabbildung mit weniger als den vier Tabellenzeilen.
- Kurs- oder Schulformzusätze im Titel, zusätzliche Beweisvarianten, technische IDs, Dateinamen, interne Pfade, Logos, Marken, Wasserzeichen oder Plattformnamen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
