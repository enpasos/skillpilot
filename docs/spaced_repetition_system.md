# Modernisiertes Adaptives Lernsystem (Spezifikation)

Dieses Dokument beschreibt den Algorithmus für ein effizientes Spaced-Repetition-System (SRS). Ziel ist die Maximierung der Merkfähigkeit bei Minimierung des Zeitaufwands. Der Status einer Karte wird nicht statisch gespeichert, sondern dynamisch aus der Lernhistorie abgeleitet ("Event Sourcing"), um Datenkonsistenz zu garantieren.

## 1. Grundprinzipien

1. **Event-Basiert:** Der aktuelle Status ("Box" oder "Level") ist immer eine Funktion der gesamten Lernhistorie.
2. **Sanfte Regression:** Fehler führen nicht zum kompletten Verlust des Fortschritts, sondern stufen die Karte auf ein früheres, stabiles Niveau zurück.
3. ** Exponentielle Intervalle:** Erfolgreiche Wiederholungen vergrößern den Abstand zur nächsten Abfrage exponentiell.

## 2. Datenmodell (Abstrakt)

Jede Lernkarte (Card) besitzt eine Liste von historischen Interaktionen (History).
Ein Eintrag in der Historie besteht aus:

* `Timestamp`: Zeitpunkt der Abfrage.
* `Result`: Das Ergebnis (`SUCCESS`, `FAILURE`, `EASY`).

## 3. Der Algorithmus: Dynamische Level-Berechnung

Wann immer der Status einer Karte benötigt wird, wird das aktuelle **Lern-Level (L)** neu berechnet.

### Logik

1. Initialisiere L = 0.
2. Sortiere die Historie chronologisch (vom ältesten zum neuesten Ereignis).
3. Iteriere durch jedes Ereignis E:
* **WENN** E ist `SUCCESS`:
* Erhöhe L um 1.


* **WENN** E ist `EASY` (optional für "sehr gut gewusst"):
* Erhöhe L um 2 (Bonus für sicheres Wissen).


* **WENN** E ist `FAILURE`:
* **Regressions-Regel:** Setze L auf \lceil L \times 0.5 \rceil (Runde auf die nächsthöhere Ganzzahl).
* *Begründung:* Das Wissen ist nicht weg, nur der Zugriff war blockiert. Ein Rückfall auf 50% des Levels verkürzt das Intervall drastisch, zwingt aber nicht zum kompletten Neulernen (vermeidet Frustration und "Overlearning").
* *Minimum:* L darf nicht unter 0 fallen.





### Vergleich zum alten Ansatz

* *Alt:* Fehler \rightarrow L=0. (Ineffizient bei hohem Level).
* *Neu:* Fehler bei Level 10 \rightarrow L=5. (Effizient, da das Intervall verkürzt wird, um das vergessene Detail aufzufrischen, ohne bei "Null" zu starten).

## 4. Zeitliche Planung (Scheduling)

Nachdem das aktuelle Level L berechnet wurde, bestimmt dieses, wann die Karte das nächste Mal fällig ist.

**Basis-Intervalle (in Tagen):**

| Level (L) | Intervall (Tage) | Lernphase |
| --- | --- | --- |
| 0 | 0 (Sofort / Heute) | Akquisition |
| 1 | 1 | Festigung |
| 2 | 3 | Festigung |
| 3 | 7 | Langzeitgedächtnis |
| 4 | 16 | Langzeitgedächtnis |
| 5 | 35 | Erhaltung |
| n > 5 | I_{n-1} \times 2.5 | Erhaltung |

*Formel für n > 2: I_n \approx I_{n-1} \times 2.5 (Multiplikator für effiziente Spreizung).*

## 5. Sonderfall: "Leech"-Erkennung (Lern-Sackgassen)

Um Effizienz zu gewährleisten, muss das System erkennen, wenn eine Karte "kaputt" ist (schlecht formuliert oder zu schwer).

* **Erkennung:** Wenn in den letzten 5 Ereignissen mehr als 3 `FAILURE`s vorkommen ODER das Level mehr als 3 Mal von >2 auf <2 gefallen ist.
* **Aktion:** Markiere die Karte als `SUSPENDED` (Ausgesetzt).
* **User-Task:** Der Benutzer muss die Karte bearbeiten/umformulieren, bevor sie wieder gelernt werden kann.

## 6. Zusammenfassendes Ablaufdiagramm (Pseudocode)

```pseudocode
function getCardStatus(card, user):
    history = loadHistory(card, user)
    level = 0
    
    // 1. Level berechnen
    foreach event in history (sorted by date ascending):
        if event.isSuccess():
            level = level + 1
        else if event.isEasy():
            level = level + 2
        else if event.isFailure():
            level = MAX(0, CEIL(level * 0.5)) // Sanfte Regression
            
    // 2. Fälligkeit berechnen
    lastSuccessDate = getLastSuccessDate(history)
    intervalDays = calculateInterval(level) // siehe Tabelle oben
    dueDate = lastSuccessDate + intervalDays
    
    return {
        currentLevel: level,
        isDue: (Today >= dueDate),
        nextReview: dueDate
    }

