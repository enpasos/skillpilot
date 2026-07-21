# Sichtbares SkillPilot-Sitzungsprotokoll

## Zweck

ChatGPT darf für Folgeaktionen keine Werte voraussetzen, die nur in einem früheren,
nicht sichtbaren Action-Response standen. Deshalb wird der kleine notwendige
Dialogzustand sichtbar und wortgleich durch die Unterhaltung getragen.

Die sichtbaren Werte sind:

- das temporäre `sps_...`-Sitzungstoken;
- der aktuelle Auswahlcode und die dazugehörigen Nummern;
- die kanonische Lernziel-UUID, sobald ein Ziel aktiv ist.

Die dauerhafte SkillPilot-ID gehört nie in den Chat.

## Start

Der erste Benutzertext aus dem Cockpit enthält das vollständige Sitzungstoken. Es
ist ein 24 Stunden gültiger temporärer Zugriff und muss exakt übernommen werden.
Es gibt in dieser Variante weder einen Startcode noch `redeemStartCode`.

Nach dem ersten Zustandsabruf wird die sichtbare Antwort des Backend als Grundlage
verwendet. Wichtige Werte müssen in der Assistentenantwort erscheinen, bevor ein
späterer Turn sie wieder benutzen darf.

## Pflichtanker

Ohne aktives Ziel ist die letzte Antwortzeile:

```text
— SkillPilot · Sitzung: <chatSessionToken>
```

Mit aktivem kanonischem Ziel ist sie:

```text
— SkillPilot · Sitzung: <chatSessionToken> · Lernziel-ID: <goalId>
```

Der Anker ist immer die letzte Zeile. Keine Satzzeichen, Hinweise oder Links folgen
danach. Nach jeder erfolgreichen Action wird ihr `relayFooter` wortgleich als
Anker verwendet. Ohne neue Action bleibt der letzte bereits sichtbare Footer
maßgeblich; er wird nicht rekonstruiert oder verändert.

## Nummerierte Auswahl

Eine Backend-Auswahl ist zeitlich lokal. Sie gilt nur zusammen mit ihrem
`selectionReference` und genau der gelieferten Optionsreihenfolge.

Darstellung:

```text
Wähle bitte einen Schwerpunkt.
Auswahlcode: A-1A2B3C4D5E6F

1. Funktionen untersuchen — Lernziel-ID: <UUID>
2. Gleichungen lösen — Lernziel-ID: <UUID>
```

Bei Lehrplan- oder Scope-Optionen bleiben interne Kennungen verborgen. Für den
Folgeschritt reichen `selectionReference` und `choiceNumber`. Niemals Optionen neu
nummerieren, zusammenfassen oder anhand bloßer Titel erraten.

Auf die Antwort „2“ folgt `applyVisibleChoice` mit der sichtbar zugehörigen
`selectionReference` und `choiceNumber=2`. Ist die Antwort mehrdeutig oder bezieht
sie sich auf eine ältere Auswahl, kurz nachfragen statt eine Action auszuführen.

## Direkte Lernzielreferenzen

Kanonische Lernziel-UUIDs dürfen bewusst sichtbar sein. Dadurch kann eine Person
ein Lernziel eindeutig aus Cockpit, Lernblatt oder PDF adressieren. Eine direkte
Zielaktion ist nur zulässig, wenn die vollständige UUID bereits sichtbar im Chat
steht. Titelähnlichkeit reicht nicht.

## Links

Verwende ausschließlich einen vom letzten erfolgreichen Zustand gelieferten
`cockpitUrl` wortgleich. Konstruiere keine Links aus IDs. Fehlt ein solcher Link,
verweise nur auf `https://skillpilot.com`. Sitzungstoken und dauerhafte
SkillPilot-ID gehören nie in einen Link.
