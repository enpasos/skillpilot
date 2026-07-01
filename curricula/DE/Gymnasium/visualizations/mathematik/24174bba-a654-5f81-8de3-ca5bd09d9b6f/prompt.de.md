# Lernzielvisualisierung: Lagebeziehung zwischen Gerade und Ebene untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `24174bba-a654-5f81-8de3-ca5bd09d9b6f`
- Titel: Lagebeziehung zwischen Gerade und Ebene untersuchen
- Beschreibung: Die lernende Person kann die Lagebeziehung zwischen einer Geraden und einer Ebene mithilfe vektorieller und koordinatenmäßiger Darstellungen begründet klassifizieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `24174bba-a654-5f81-8de3-ca5bd09d9b6f.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/24174bba-a654-5f81-8de3-ca5bd09d9b6f/24174bba-a654-5f81-8de3-ca5bd09d9b6f.jpg`

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

Titel: Lagebeziehung zwischen Gerade und Ebene untersuchen
Beschreibung: Die lernende Person kann die Lagebeziehung zwischen einer Geraden und einer Ebene mithilfe vektorieller und koordinatenmäßiger Darstellungen begründet klassifizieren.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Lagebeziehung zwischen Gerade und Ebene rechnerisch klassifizieren.
- Verwende eine gemeinsame Ebene:
  E: x + y + z = 3,
  Normalenvektor n=(1; 1; 1).
- Zeige drei kurze Faelle als Entscheidungstafel:
  1) Schneidend:
     g1: X=(1; 0; 0)+t*(1; 1; 0).
     v1=(1;1;0), n*v1=2 ungleich 0.
     Einsetzen: (1+t)+t+0=3 -> 1+2t=3 -> t=1.
     Schnittpunkt S=(2;1;0).
  2) Echt parallel:
     g2: X=(0; 0; 4)+t*(1; -1; 0).
     v2=(1;-1;0), n*v2=0.
     Stuetzpunktprobe: 0+0+4=4 ungleich 3.
     Ergebnis: g2 ist parallel zu E und liegt nicht in E.
  3) In der Ebene:
     g3: X=(3; 0; 0)+t*(1; -1; 0).
     v3=(1;-1;0), n*v3=0.
     Stuetzpunktprobe: 3+0+0=3.
     Ergebnis: g3 liegt ganz in E.
- Zeige eine kleine 3D-Skizze mit einer Ebene und drei unterschiedlich gefaerbten Geraden: g1 schneidet, g2 ist darueber parallel, g3 liegt in der Ebene.

Vermeiden:
- g2 nicht als Gerade in der Ebene zeichnen.
- g3 nicht als nur einen Schnittpunkt darstellen.
- Nicht behaupten, n*v=0 bedeute automatisch "liegt in der Ebene"; zusaetzlich ist die Stuetzpunktprobe noetig.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
