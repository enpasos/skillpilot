# Bildrekonstruktionsprompt: Ereignisse als Mengen verknüpfen

## SkillPilot-Ziel

- SkillPilot-ID: `71d1fd4d-8471-5f25-94a0-4c531a74783c`
- Titel: Ereignisse als Mengen verknüpfen
- Beschreibung: Die lernende Person kann Ereignisse als Mengen darstellen, Und-, Oder-, Gegen- und Differenzereignisse sowie exklusives Oder in Mengenschreibweise übersetzen und einfache Regeln wie $A\setminus B=A\cap\overline{B}$ oder $\overline{A\cup B}=\overline{A}\cap\overline{B}$ an Beispielen auswerten.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `71d1fd4d-8471-5f25-94a0-4c531a74783c.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Infografik-Design auf einem hellen cremefarbenen Hintergrund. Alle Elemente haben schwarze Umrisse und abgerundete Ecken.

Oben mittig steht der fette schwarze Titel "EREIGNISSE ALS MENGEN VERKNÜPFEN".

Darunter sind drei große, hellbeige Tafeln horizontal angeordnet. Jede Tafel hat einen fetten schwarzen Titel oben.

**Linke Tafel: "1. Ereignis als Menge"**
*   Oben steht "Ereignis A".
*   Darunter ist eine hellblaue, wolkenförmige Figur mit schwarzem Umriss. In der Wolke sind fünf weiße Würfel mit schwarzen Punkten, die die Augenzahlen 1, 3, 5, 3, 5 zeigen.
*   Ein schwarzer Pfeil zeigt von der Wolke nach rechts unten.
*   Neben dem Pfeil steht "Menge A".
*   Rechts unten ist ein hellblauer Kreis mit schwarzem Umriss, der den Text "{1, 3, 5}" enthält.
*   Ganz unten in dieser Tafel ist ein kleineres, hellbeiges Feld mit abgerundeten Ecken und schwarzem Umriss, das den Text "Darstellung: $A = \{1, 3, 5\}$" enthält.

**Mittlere Tafel: "2. Grundoperationen (Venn-Diagramme & Notation)"**
*   Diese Tafel enthält fünf kleinere, hellbeige Felder mit abgerundeten Ecken und schwarzem Umriss, angeordnet in zwei Reihen (drei oben, zwei unten linksbündig).

    *   **Oben links:**
        *   Titel: "Und ($A \cap B$)"
        *   Venn-Diagramm: Zwei sich überlappende Kreise. Der linke Kreis (A) ist hellblau, der rechte Kreis (B) ist hellrot. Die Überlappungsfläche ist hellviolett.
        *   Darunter steht: "$A \cap B$"

    *   **Oben mittig:**
        *   Titel: "Oder ($A \cup B$)"
        *   Venn-Diagramm: Zwei sich überlappende Kreise. Beide Kreise (A und B) und die Überlappungsfläche sind hellviolett.
        *   Darunter steht: "$A \cup B$"

    *   **Oben rechts:**
        *   Titel: "Gegenereignis ($\overline{A}$)"
        *   Venn-Diagramm: Ein hellgraues Rechteck (Universum) mit einem hellblauen Kreis (A) darin. Der Bereich außerhalb des Kreises, aber innerhalb des Rechtecks, ist hellgrau.
        *   Darunter steht: "$\overline{A}$"

    *   **Unten links:**
        *   Titel: "Differenz ($A \setminus B$)"
        *   Venn-Diagramm: Zwei sich überlappende Kreise. Der linke Kreis (A) ist hellblau, der rechte Kreis (B) ist hellrot. Die Überlappungsfläche ist weiß. Nur der nicht-überlappende Teil von A ist hellblau gefärbt.
        *   Darunter steht: "$A \setminus B$"

    *   **Unten mittig:**
        *   Titel: "Exklusives Oder ($A \Delta B$)"
        *   Venn-Diagramm: Zwei sich überlappende Kreise. Der linke Kreis (A) ist hellblau, der rechte Kreis (B) ist hellrot. Die Überlappungsfläche ist weiß. Die nicht-überlappenden Teile von A und B sind hellblau bzw. hellrot gefärbt.
        *   Darunter steht: "$A \Delta B$"

**Rechte Tafel: "3. Regeln & Beispiele"**
*   Diese Tafel enthält zwei kleinere, hellbeige Felder mit abgerundeten Ecken und schwarzem Umriss, vertikal übereinander angeordnet.

    *   **Oberes Feld:**
        *   Titel: "Regel: $A \setminus B = A \cap \overline{B}$"
        *   Darunter sind zwei Venn-Diagramme, getrennt durch ein Gleichheitszeichen.
            *   **Linkes Diagramm:** Zwei sich überlappende Kreise. Der linke Kreis (A) ist hellblau, der rechte Kreis (B) ist hellrot. Die Überlappungsfläche ist weiß. Nur der nicht-überlappende Teil von A ist hellblau gefärbt.
            *   **Gleichheitszeichen:** "="
            *   **Rechtes Diagramm:** Zwei sich überlappende Kreise. Der linke Kreis (A) ist hellblau, der rechte Kreis (B) ist hellgrau. Die Überlappungsfläche ist hellblau. Der nicht-überlappende Teil von B ist hellgrau.
        *   Darunter stehen die Notationen "$A \setminus B$" (links) und "$A \cap \overline{B}$" (rechts).

    *   **Unteres Feld:**
        *   Titel: "De Morgan: $\overline{A \cup B} = \overline{A} \cap \overline{B}$"
        *   Darunter sind zwei Venn-Diagramme, jeweils in einem hellgrauen Rechteck, getrennt durch ein Gleichheitszeichen.
            *   **Linkes Diagramm:** Ein hellgraues Rechteck. Darin zwei sich überlappende Kreise (A und B). Beide Kreise und ihre Überlappungsfläche sind weiß. Der Bereich außerhalb beider Kreise, aber innerhalb des Rechtecks, ist hellgrau.
            *   **Gleichheitszeichen:** "="
            *   **Rechtes Diagramm:** Ein hellgraues Rechteck. Darin zwei sich überlappende Kreise (A und B). Beide Kreise und ihre Überlappungsfläche sind weiß. Der Bereich außerhalb beider Kreise, aber innerhalb des Rechtecks, ist hellgrau.
        *   Darunter stehen die Notationen "$\overline{A \cup B}$" (links) und "$\overline{A} \cap \overline{B}$" (rechts).
```
