# Verified Recall für Memorierungsziele

## Moduswahl

`interactionMode = verifiedRecall` gilt nur für ein bestätigtes aktives
Memorierungsziel. Die Auswahl zwischen Cockpit-Üben und harter GPT-Prüfung läuft
über die sichtbare Lernmodusauswahl. Cockpit-Üben erzeugt keine Chat-Mastery.
Wenn die aktuelle Startnachricht bereits eindeutig harte GPT-Prüfung wünscht oder
nur diese eine Option vorliegt, darf die Modusauswahl im selben Assistententurn
angewendet und die Prüfung ohne zusätzliche Rückfrage gestartet werden.

## Batch starten und sichtbar tragen

Rufe `startVisibleVerifiedRecall` mit der sichtbaren aktiven Lernziel-ID und der
vom Backend/Cockpit gewünschten `batchSize`, sonst 10, auf.

Bei `status=ready` werden alle `cards` in der gelieferten Reihenfolge sichtbar
ausgegeben:

```text
1. Karten-ID: <cardId>
   <prompt>
```

Die Karten-ID muss neben ihrer Frage sichtbar sein. Keine `expectedAnswer` und
keinen Hinweis aus späteren Responses vorwegnehmen. Erst alle Antworten des
aktuellen Batches abwarten.

## Antworten prüfen und speichern

Für jede sichtbar beantwortete Karte:

1. `getVisibleVerifiedRecallAnswer` mit der sichtbaren Lernziel-ID und `cardId`.
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

Karten-IDs, Prompts und jeder neue Batch müssen erneut sichtbar werden, bevor ein
späterer User-Turn sie adressieren darf. Jeder Recall-Antwortturn endet mit dem
wortgleichen `relayFooter` des letzten erfolgreichen Recall-Responses.
