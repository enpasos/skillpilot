# Lernzielvisualisierung: Abstandsverfahren im Raum auswählen und anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `fac75b4a-4ec2-5d38-bbce-9b002c8a4904`
- Titel: Abstandsverfahren im Raum auswählen und anwenden
- Beschreibung: Die lernende Person kann für eine gegebene Punkt-, Geraden- oder Ebenenkonfiguration ein passendes analytisches Abstandsverfahren auswählen und anwenden.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `fac75b4a-4ec2-5d38-bbce-9b002c8a4904.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/fac75b4a-4ec2-5d38-bbce-9b002c8a4904/fac75b4a-4ec2-5d38-bbce-9b002c8a4904.jpg`

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

Titel: Abstandsverfahren im Raum auswählen und anwenden
Beschreibung: Die lernende Person kann für eine gegebene Punkt-, Geraden- oder Ebenenkonfiguration ein passendes analytisches Abstandsverfahren auswählen und anwenden.

Zusatzanweisung:
Pflichtinhalt:
- Regeneration wegen Rechenrisiko: Verwende einfachere Abstandsbeispiele ohne fehleranfällige Zwischenvereinfachung.
- Thema: Passendes Abstandsverfahren im Raum auswaehlen und anwenden.
- Zeige eine Entscheidungstafel mit vier Faellen:
  1) Punkt-Punkt:
     P=(1;2;2), Q=(4;6;2).
     Verfahren: Differenzvektor und Laenge.
     Q-P=(3;4;0).
     d(P,Q)=sqrt(3^2+4^2+0^2)=5.
  2) Punkt-Ebene:
     E0: z=0, A=(2;3;4).
     Verfahren: Lot zur Ebene oder Hesse bei z=0.
     d(A,E0)=|4|=4.
  3) Gerade-Ebene parallel:
     E0: z=0, g: X=(1;2;3)+t*(1;1;0).
     Verfahren: einen Punkt der Geraden nehmen.
     P_g=(1;2;3), d(g,E0)=d(P_g,E0)=|3|=3.
  4) Schneidende Objekte:
     Wenn eine Gerade eine Ebene schneidet, ist der Abstand 0.
- Deutung:
  Erst Lagebeziehung pruefen, dann passendes Abstandsverfahren waehlen.

Vermeiden:
- Keine alte Punkt-Ebene-Rechnung mit E: 2x-y+2z=6 zeigen.
- Nicht d(A,E0)=3 oder 5 schreiben; fuer A=(2;3;4) und E0:z=0 ist der Abstand 4.
- Nicht fuer schneidende Objekte einen positiven Abstand eintragen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
