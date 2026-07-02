# Lernzielvisualisierung: Grenzprozesse und Grenzmatrizen interpretieren (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `922d89fc-1cbd-56e9-ac5d-5cb59085de6c`
- Titel: Grenzprozesse und Grenzmatrizen interpretieren (LK)
- Beschreibung: Die lernende Person kann Grenzprozesse bei Potenzen von Übergangsmatrizen untersuchen, Grenzmatrizen interpretieren und ihre Bedeutung für stabile Langzeitentwicklungen erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `922d89fc-1cbd-56e9-ac5d-5cb59085de6c.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/922d89fc-1cbd-56e9-ac5d-5cb59085de6c/922d89fc-1cbd-56e9-ac5d-5cb59085de6c.jpg`

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

Titel: Grenzprozesse und Grenzmatrizen interpretieren (LK)
Beschreibung: Die lernende Person kann Grenzprozesse bei Potenzen von Übergangsmatrizen untersuchen, Grenzmatrizen interpretieren und ihre Bedeutung für stabile Langzeitentwicklungen erläutern.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Grenzprozess und Grenzmatrix einer Markov-Kette interpretieren.
- Verwende die spaltenstochastische Matrix:
  M =
    [0.8  0.3
     0.2  0.7]
  Spalten "von" A, B; Zeilen "nach" A, B.
- Zeige:
  M^n fuer grosse n naehert sich der Grenzmatrix G.
  G =
    [0.6  0.6
     0.4  0.4]
- Deutung der Grenzmatrix:
  Beide Spalten sind gleich.
  Unabhaengig vom Startzustand entsteht langfristig der stabile Zustand (0.6, 0.4)^T.
- Zeige zwei Startbeispiele:
  Start A: v_0=(1,0)^T, langfristig G*v_0=(0.6,0.4)^T.
  Start B: v_0=(0,1)^T, langfristig G*v_0=(0.6,0.4)^T.
- Optional klein:
  M^10 ist schon nahe bei G.

Vermeiden:
- Die Grenzmatrix nicht als Nullmatrix oder Einheitsmatrix darstellen.
- Die Spalten von G nicht unterschiedlich machen; beide Spalten muessen (0.6,0.4)^T sein.
- Nicht behaupten, der Grenzzustand haenge hier noch vom Startzustand ab.
- Spalten "von" und Zeilen "nach" nicht vertauschen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
