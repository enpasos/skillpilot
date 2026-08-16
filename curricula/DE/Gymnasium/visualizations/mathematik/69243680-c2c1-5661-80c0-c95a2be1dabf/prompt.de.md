# Lernzielvisualisierung: Geometrische Abbildungen als linear erkennen

## SkillPilot-Ziel

- SkillPilot-ID: `69243680-c2c1-5661-80c0-c95a2be1dabf`
- Titel: Geometrische Abbildungen als linear erkennen
- Beschreibung: Die lernende Person kann bei einer einfachen geometrischen Abbildung anhand der Verträglichkeit mit Vektoraddition und skalarer Multiplikation prüfen, ob sie linear ist.

## Generator

- Provider: OpenAI image generation
- Status: pilot
- Quellbild: `69243680-c2c1-5661-80c0-c95a2be1dabf.png`
- Public Asset: `/assets/goal-visualizations/mathematik/69243680-c2c1-5661-80c0-c95a2be1dabf/69243680-c2c1-5661-80c0-c95a2be1dabf.png`

## Prompt

```text
Erzeuge eine fachlich exakte Mathematik-Infografik im Querformat 16:9, weißer bis sehr hellblauer Hintergrund, moderner ruhiger Schulbuchstil, ausschließlich deutscher Text, keine Logos/Wasserzeichen. Titel: „Geometrische Abbildungen als linear erkennen“.

Die Grafik muss zwei gleich große Hauptpanels zeigen und mathematisch exakt gezeichnet sein.

Linkes Panel „1 Additivität“:

- Definiere sichtbar die Beispielabbildung `T(x,y)=(2x,y)`.
- Linke Koordinatenskizze mit exakt diesen Pfeilen vom Ursprung: `u=(1,0)`, `v=(0,1)`, `u+v=(1,1)`. Zeichne das Einheitsquadrat/Parallelogramm vollständig und korrekt: u horizontal, v vertikal, u+v diagonal; gestrichelte Parallelogrammseiten schließen exakt bei `(1,1)`.
- Rechte Koordinatenskizze mit exakt diesen Pfeilen vom Ursprung: `T(u)=(2,0)`, `T(v)=(0,1)`, `T(u+v)=(2,1)`. Zeichne das transformierte Rechteck/Parallelogramm vollständig und korrekt; gestrichelte Seiten schließen exakt bei `(2,1)`. Beschrifte jeden Pfeil eindeutig.
- Großes korrektes Formelfeld: `T(u+v)=T(u)+T(v)`.

Rechtes Panel „2 Homogenität“:

- Verwende dieselbe Abbildung `T(x,y)=(2x,y)`, `u=(1,1)`, `λ=2`.
- Linke kleine Skizze: `u=(1,1)`, `λu=(2,2)` auf derselben Ursprungsgeraden.
- Rechte kleine Skizze: `T(u)=(2,1)`, `T(λu)=(4,2)=λT(u)`, ebenfalls kollinear und im Längenverhältnis 1:2.
- Großes korrektes Formelfeld: `T(λu)=λT(u)`.

Schlussfelder:

„LINEAR ⇔ beide Regeln gelten für alle u, v und λ“

und darunter als Warnung:

„Nur T(0)=0 oder Ursprungsgeraden zu erhalten reicht nicht.“

Unbedingt vermeiden:

- keine ungefähr gezeichneten oder offenen Parallelogramme;
- `T(u+v)` muss geometrisch exakt die Summe `T(u)+T(v)` sein;
- keine Pfeilspitze am falschen Koordinatenpunkt;
- keine Vertauschung von u, v, λu, T(u), T(v);
- kein Beispiel, das nur `T(0)=0` zeigt;
- mathematische Notation und Umlaute fehlerfrei und groß lesbar.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
