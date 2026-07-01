# Lernzielvisualisierung: Flächen unter Graphen näherungsweise bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`
- Titel: Flächen unter Graphen näherungsweise bestimmen
- Beschreibung: Die lernende Person kann Flächeninhalte unter Funktionsgraphen durch Rechtecksummen (Ober- und Untersummen) und andere Näherungsverfahren bestimmen, diese als Summen schreiben und die Genauigkeit der Approximation einschätzen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6/94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Mathematik.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible mathematische Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Flächen unter Graphen näherungsweise bestimmen
Beschreibung: Die lernende Person kann Flächeninhalte unter Funktionsgraphen durch Rechtecksummen (Ober- und Untersummen) und andere Näherungsverfahren bestimmen, diese als Summen schreiben und die Genauigkeit der Approximation einschätzen.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration: Fokus auf eine exakte Intervalltabelle, damit keine Rechtecke verschoben werden.
- Thema: Flaeche unter einem Graphen naeherungsweise mit Ober- und Untersumme bestimmen.
- Verwende genau f(x)=x+1 auf [0,4] und Delta x = 1.
- Zeige den Graphen als steigende Gerade von (0|1) bis (4|5).
- Wenn Rechtecke gezeichnet werden, muessen alle vier Intervalle sichtbar abgedeckt sein:
  [0,1], [1,2], [2,3], [3,4].
- Hauptinhalt als Tabelle:
  Intervall | linker Wert fuer Untersumme | rechter Wert fuer Obersumme
  [0,1] | f(0)=1 | f(1)=2
  [1,2] | f(1)=2 | f(2)=3
  [2,3] | f(2)=3 | f(3)=4
  [3,4] | f(3)=4 | f(4)=5
- Summen:
  Untersumme = 1*(1+2+3+4)=10.
  Obersumme = 1*(2+3+4+5)=14.
- Ergebnisbox:
  10 <= Flaeche <= 14; exakter Wert = 12; feinere Rechtecke verbessern die Naeherung.

Strikt vermeiden:
- Keine verschobenen Rechtecke.
- Kein leerer Abschnitt im Intervall [0,4].
- Die Obersumme darf nicht erst bei x=1 beginnen; sie gehoert ebenfalls zu den vier Intervallen [0,1] bis [3,4].
- Bei dieser steigenden Funktion nicht rechte Randwerte als Untersumme beschriften.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
