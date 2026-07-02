# Lernzielvisualisierung: Lotfußpunktverfahren für Abstände zwischen Punkten, Geraden und Ebenen anwenden (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `c2c49659-5917-5be5-a3bd-e46f1b17126f`
- Titel: Lotfußpunktverfahren für Abstände zwischen Punkten, Geraden und Ebenen anwenden (LK)
- Beschreibung: Die lernende Person kann Lotfußpunktverfahren zur Abstandsbestimmung zwischen Punkten, Geraden und Ebenen erarbeiten, auswählen und in unterschiedlichen räumlichen Konfigurationen anwenden.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `c2c49659-5917-5be5-a3bd-e46f1b17126f.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/c2c49659-5917-5be5-a3bd-e46f1b17126f/c2c49659-5917-5be5-a3bd-e46f1b17126f.jpg`

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

Titel: Lotfußpunktverfahren für Abstände zwischen Punkten, Geraden und Ebenen anwenden (LK)
Beschreibung: Die lernende Person kann Lotfußpunktverfahren zur Abstandsbestimmung zwischen Punkten, Geraden und Ebenen erarbeiten, auswählen und in unterschiedlichen räumlichen Konfigurationen anwenden.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Lotfusspunktverfahren fuer verschiedene Abstandstypen auswaehlen und anwenden.
- Verwende eine uebersichtliche Vergleichstafel mit drei Karten, keine perspektivisch komplizierte 3D-Szene.
- Karte 1: Punkt-Ebene-Abstand
  E: z = 0, P(2|1|4).
  Lotfusspunkt F(2|1|0), Abstand d = 4.
  Kurzer Hinweis: Lotrichtung ist Normalenrichtung der Ebene.
- Karte 2: Punkt-Gerade-Abstand
  g: x = (0,0,0) + t*(2,0,0), P(1|3|0).
  Lotfusspunkt F(1|0|0), PF = (0,3,0).
  Orthogonalitaetscheck: PF * (2,0,0) = 0.
  Abstand d = 3.
- Karte 3: Gerade-Ebene-Abstand bei paralleler Gerade
  h: x = (0,0,3) + t*(1,1,0), E: z = 0.
  h ist parallel zu E, Abstand ist Abstand eines Punktes A(0|0|3) zu E.
  d(h,E) = 3.
- Jede Karte soll genau einen Lotfusspunkt oder eine klare Bezugsidee zeigen.
- Finale Darstellungsprioritaet:
  - Karte 1 Punkt-Ebene: schematische Seitenansicht, horizontale Ebene z=0, P senkrecht ueber F.
  - Karte 2 Punkt-Gerade: reine 2D-Draufsicht in der xy-Ebene mit der Beschriftung "Draufsicht z=0"; keine z-Achse. Zeichne g als horizontale x-Achse y=0, P(1|3|0) oberhalb in positiver y-Richtung und F(1|0|0) direkt darunter auf g. PF ist eine senkrechte Strecke in der 2D-Draufsicht und bedeutet y-Abstand, nicht z-Abstand.
  - Karte 3 Gerade-Ebene: schematische Seitenansicht mit E: z=0 als horizontale Ebene und h in der Hoehe z=3 parallel dazu.

Vermeiden:
- Keine zweite moegliche Fussmarkierung in derselben Karte.
- Keine Lotstrecke zeichnen, die nicht senkrecht zur dargestellten Gerade oder Ebene ist.
- Punkt-Gerade-Abstand nicht mit Punkt-Ebene-Abstand verwechseln.
- In der Punkt-Gerade-Karte P(1|3|0) nicht als Punkt oberhalb der xy-Ebene oder als z-Abstand darstellen; P und F haben beide z=0.
- In der Punkt-Gerade-Karte keine perspektivische 3D-Achsenzeichnung verwenden.
- Bei h und E nicht schneiden lassen; h liegt in der Ebene z=3 und ist parallel zu E: z=0.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
