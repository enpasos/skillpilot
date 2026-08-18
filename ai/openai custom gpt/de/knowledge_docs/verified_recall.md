# Verified Recall für Memorierungsziele

## Moduswahl

`interactionMode = verifiedRecall` gilt nur für ein bestätigtes aktives
Memorierungsziel. Die Auswahl zwischen Cockpit-Üben und harter GPT-Prüfung läuft
über die aktuelle Lernmodusauswahl. Cockpit-Üben erzeugt keine Chat-Mastery.
Wenn die aktuelle Startnachricht bereits eindeutig harte GPT-Prüfung wünscht oder
nur diese eine Option vorliegt, darf die Modusauswahl im selben Assistententurn
angewendet und die Prüfung ohne zusätzliche Rückfrage gestartet werden.

## Batch starten und präsentieren

Rufe `startVisibleVerifiedRecall` für das aktive Lernziel auf. Wähle keine
`batchSize`; Batchgröße, Kartenmenge und Reihenfolge gehören dem Backend.

Bei `status=ready` werden alle `cards` in der gelieferten Reihenfolge sichtbar
ausgegeben:

```text
1. Karten-ID: <cardId>
   <prompt>
```

Im privaten Modus wird nur der Prompt mit sichtbarer Nummer gezeigt und die
Karten-ID intern behalten. Nur im sichtbaren Notfallmodus muss die Karten-ID neben
ihrer Frage stehen. Keine `expectedAnswer` und keinen Hinweis aus späteren
Responses vorwegnehmen. Erst alle Antworten des aktuellen Batches abwarten.

## Antworten prüfen und speichern

Für jede beantwortete Karte:

1. `getVisibleVerifiedRecallAnswer` mit der frisch gelieferten Lernziel-ID und `cardId`.
2. Lernendenantwort fachlich mit der jetzt gelieferten `expectedAnswer` vergleichen.
3. `recordVisibleVerifiedRecallResult` im selben Turn mit `passed` und kurzer
   Begründung aufrufen.

`passed=true` nur bei ausreichend korrekter Antwort ohne Kartenhilfe. Bei Fehler
darf die richtige Antwort anschließend erklärt werden. Jede Karte des Batches wird
gespeichert, bevor ein neuer Batch gestartet oder ein `next`-Prompt genutzt wird.

## Tages-Lock und Abschluss

Jede Karte höchstens einmal pro Kalendertag hart prüfen. Nach `passed=false` heute
nicht erneut stellen. `status=waiting` beendet die Prüfung bis
`nextEligibleAt`; nichts improvisieren. `status=complete` oder
`masterySaved=true` bedeutet, dass das Backend den Abschluss gespeichert hat.
Dann niemals zusätzlich `setVisibleMastery` aufrufen.

Im privaten Modus müssen Prompts erneut sichtbar sein, IDs bleiben im
Action-Kontext; fehlen sie später, gilt die Retention als fehlgeschlagen. Im
Notfallmodus müssen Karten-IDs, Prompts und jeder neue Batch erneut sichtbar sein.
Nur dort endet jeder Recall-Antwortturn mit dem wortgleichen `relayFooter` des
letzten erfolgreichen Recall-Responses.
