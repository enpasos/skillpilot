# Lernzielvisualisierung: Parameterabhängige Winkel und Lagebeziehungen untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `5f90df42-8a71-534d-b995-b8f7dcaf1661`
- Titel: Parameterabhängige Winkel und Lagebeziehungen untersuchen
- Beschreibung: Die lernende Person kann Winkel, Orthogonalität, Parallelität und die genannten Lagebeziehungen in räumlichen Konfigurationen in Abhängigkeit von einem zusätzlichen Parameter untersuchen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `5f90df42-8a71-534d-b995-b8f7dcaf1661.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/5f90df42-8a71-534d-b995-b8f7dcaf1661/5f90df42-8a71-534d-b995-b8f7dcaf1661.jpg`

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

Titel: Parameterabhängige Winkel und Lagebeziehungen untersuchen
Beschreibung: Die lernende Person kann Winkel, Orthogonalität, Parallelität und die genannten Lagebeziehungen in räumlichen Konfigurationen in Abhängigkeit von einem zusätzlichen Parameter untersuchen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Parameterabhaengige Winkel, Orthogonalitaet und Parallelitaet untersuchen.
- Zeige zwei vom Parameter k abhaengige Richtungsvektoren:
  u(k) = (1, k, 0)
  v(k) = (k, 1, 0)
- Winkelbeziehung:
  u(k) * v(k) = 1*k + k*1 + 0*0 = 2k.
  |u(k)| = |v(k)| = sqrt(1 + k^2).
  cos(alpha) = 2k / (1 + k^2).
- Orthogonalitaet:
  u(k) * v(k) = 0 genau fuer k = 0.
- Parallelitaet:
  u(k) und v(k) sind parallel genau fuer k = 1 oder k = -1.
  Bei k=1: u=(1,1,0), v=(1,1,0).
  Bei k=-1: u=(1,-1,0), v=(-1,1,0) = -u.
- Zeige drei Beispielkarten:
  k=0 orthogonal,
  k=1 parallel gleiche Richtung,
  k=-1 parallel entgegengesetzte Richtung.

Vermeiden:
- Nicht behaupten, dass Orthogonalitaet fuer k=1 oder k=-1 gilt.
- Nicht behaupten, dass Parallelitaet nur fuer k=1 gilt; k=-1 ist auch parallel.
- Keine windschiefen Geraden darstellen; hier geht es nur um Richtungsvektoren in der xy-Ebene.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
