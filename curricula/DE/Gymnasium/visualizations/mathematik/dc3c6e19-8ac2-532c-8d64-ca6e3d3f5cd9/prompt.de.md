# Lernzielvisualisierung: Stammfunktionen durch Formansatz bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `dc3c6e19-8ac2-532c-8d64-ca6e3d3f5cd9`
- Titel: Stammfunktionen durch Formansatz bestimmen
- Beschreibung: Die lernende Person kann für geeignete Integranden eine Stammfunktion mithilfe eines Formansatzes mit Koeffizientenvergleich bestimmen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `dc3c6e19-8ac2-532c-8d64-ca6e3d3f5cd9.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/dc3c6e19-8ac2-532c-8d64-ca6e3d3f5cd9/dc3c6e19-8ac2-532c-8d64-ca6e3d3f5cd9.jpg`

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

Titel: Stammfunktionen durch Formansatz bestimmen
Beschreibung: Die lernende Person kann für geeignete Integranden eine Stammfunktion mithilfe eines Formansatzes mit Koeffizientenvergleich bestimmen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Stammfunktion durch Formansatz mit Koeffizientenvergleich bestimmen.
- Verwende den Integranden:
  f(x)=(2x+3)*e^x.
- Waehle wegen der Form "linearer Faktor mal e^x" den Ansatz:
  F(x)=(a*x+b)*e^x.
- Leite den Ansatz ab:
  F'(x)=a*e^x+(a*x+b)*e^x
       =(a*x+a+b)*e^x.
- Koeffizientenvergleich mit (2x+3)*e^x:
  a=2
  a+b=3 -> b=1.
- Ergebnis:
  F(x)=(2x+1)*e^x.
- Kontrolle:
  F'(x)=(2x+3)*e^x=f(x).

Vermeiden:
- Nicht nur raten; der Koeffizientenvergleich muss sichtbar sein.
- Nicht den Produktregel-Term a*e^x vergessen.
- Nicht b=3 setzen; aus a+b=3 und a=2 folgt b=1.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
