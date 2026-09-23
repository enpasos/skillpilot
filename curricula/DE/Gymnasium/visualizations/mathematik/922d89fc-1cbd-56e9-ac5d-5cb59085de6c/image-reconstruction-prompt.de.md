# Bildrekonstruktionsprompt: Grenzprozesse und Grenzmatrizen interpretieren (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `922d89fc-1cbd-56e9-ac5d-5cb59085de6c`
- Titel: Grenzprozesse und Grenzmatrizen interpretieren (LK)
- Beschreibung: Die lernende Person kann Grenzprozesse bei Potenzen von Übergangsmatrizen untersuchen, Grenzmatrizen interpretieren und ihre Bedeutung für stabile Langzeitentwicklungen erläutern.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation
- Quellbild: `922d89fc-1cbd-56e9-ac5d-5cb59085de6c.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Erzeuge eine eigenständige deutsche Lerninfografik im breiten Querformat, ungefähr 16:9, als PNG. Keine Bildvorlage ist erforderlich. Klarer, freundlicher, abstrakter Lernplakatstil mit kräftigen schwarzen Konturen, weißen Flächen, sehr hellblauen Kopfleisten und blauen Blockpfeilen. Abgerundete Kästen und Sprechblasen, gut lesbare schwarze serifenlose Schrift. Kein Fotorealismus, keine zusätzlichen Figuren, Logos, technischen IDs, Wasserzeichen oder Dateinamen. Großzügige Abstände. Die mathematische Notation muss sauber gesetzt sein.

Titel oben in einem durchgehenden hellblauen Band: „Langfristiges Verhalten einer Markov-Kette deuten“.

Darunter eine von links nach rechts lesbare Darstellung mit zwei mittleren Kästen und zwei rechten Start-/Ergebniszweigen:

1. Links ein Kasten „Übergangsmatrix M“. Darin eine exakt ausgerichtete 2×2-Matrix in eckigen Klammern:
   erste Zeile 0,8   0,3
   zweite Zeile 0,2   0,7.
   Über den Spalten stehen „Von A“ und „Von B“; links neben den Zeilen „Nach A“ und „Nach B“. Die Spalten sind die Ausgangszustände, die Zeilen die Folgezustände. Keine Zeilen/Spalten vertauschen.

2. Ein breiter hellblauer Pfeil führt zum oberen mittleren Kasten. Über dem Pfeil: „Potenzieren für n → ∞“. Darunter: „Mⁿ nähert sich G“.

3. Oberer mittlerer Kasten „Grenzmatrix G“. Darin die 2×2-Matrix:
   erste Zeile 0,6   0,6
   zweite Zeile 0,4   0,4.
   Oberhalb eine Sprechblase „Gleiche Spalten!“, mit zwei schlanken hellblauen Pfeilen zu den beiden Spalten. Die Pfeile dürfen die Beschriftung oder Zahlen nicht verdecken.

4. Unterer mittlerer Kasten „Stationärer Vektor g“. Darin g = ein echter vertikaler Spaltenvektor, oben 0,6 und darunter 0,4, mit runden hohen Klammern. An diesem bereits senkrechten Vektor steht KEIN hochgestelltes T. Von M führt ein abgewinkelter hellblauer Pfeil zum Kasten. Daneben eine Sprechblase „M · g = g“.

5. Rechts von G verzweigt die Darstellung nach oben und unten:
   oben Kasten „Start A“, darunter „z. B. v₀ = (1, 0)ᵀ“;
   unten Kasten „Start B“, darunter „z. B. v₀ = (0, 1)ᵀ“.
   Hier sind (1, 0) und (0, 1) tatsächlich WAAGERECHT gesetzt; deshalb bleibt das hochgestellte T hier stehen. Von jedem Startkasten ein blauer Pfeil nach rechts, beschriftet „Langfristig“ und „G · v₀“.

6. Beide rechten Ergebnisfelder tragen denselben Text:
   „Stabiler Langzeitzustand:
   Anteil A: 0,6
   Anteil B: 0,4“.
   Darunter eine große, aber luftige Schluss-Sprechblase mit Bezug zum stationären Vektor:
   „Unabhängig vom Startzustand:
   Stabiler Langzeitzustand (0,6; 0,4)ᵀ“.
   Das abschließende Zahlenpaar wird waagerecht gesetzt und erhält daher ein T.

Die Aussage über Startunabhängigkeit bezieht sich ausschließlich auf die konkret gezeigte Übergangsmatrix und normierte Wahrscheinlichkeitsverteilungen. Nicht behaupten, dass jede Markov-Kette konvergiert. Keine weiteren Sätze, Beispiele oder Formeln ins Bild einfügen. Alle Dezimalkommas, Indizes, Matrixklammern, Potenzen und gültigen Transpositionszeichen erhalten. Als fachliche Kontrolle gilt: M mal den Spaltenvektor (0,6;0,4) ergibt denselben Spaltenvektor; beide Spalten von G stimmen damit überein. Die unterschiedlichen Starts müssen sichtbar zum selben Ergebnis führen.

Dies ist ein vollständiger Rekonstruktionsprompt für einen neu zu prüfenden Kandidaten, keine Freigabe und keine Anweisung zur Änderung einer aktiven Datei.
```
