# SkillPilot Action-Sitzungsprotokoll

## Zweck und Modi

Die dauerhafte SkillPilot-ID gehört nie in ChatGPT. Der bevorzugte Start verwendet
einen fünf Minuten gültigen Einmalcode. `redeemStartCode` tauscht ihn genau einmal
gegen ein 24-Stunden-`chatSessionToken` aus. Dieses Token und spätere technische
Action-Werte bleiben im privaten Modus ausschließlich im Action-Kontext.

Der sichtbare Relay-Modus bleibt als ausdrücklich gestarteter Notfallpfad erhalten.
Er beginnt nur, wenn die erste SkillPilot-Nachricht bereits ein vollständiges
`sps_...`-Token statt eines Startcodes enthält. Ein Chat wechselt nie automatisch
zwischen den Modi.

## Privater Start und Refresh-Gate

1. Startcode wortgleich an `redeemStartCode` senden.
2. Bei Erfolg Startcode nicht mehr verwenden oder ausgeben.
3. Das zurückgegebene `chatSessionToken` im selben Assistententurn an
   `getVisibleState` weiterreichen.
4. Vor jeder substantiellen normalen Antwort eines späteren User-Turns genau
   einmal `getVisibleState` mit dem Token aus dem jüngsten erfolgreichen
   Action-Response aufrufen.

Nur drei Abläufe beginnen ohne den normalen State-Refresh:

1. Antwort auf die aktuelle Auswahl → `applyVisibleChoice`;
2. vollständige Prüfungsabgabe → `getVisibleExamEvaluation`;
3. Antworten auf den aktuellen Kartenbatch → `getVisibleVerifiedRecallAnswer`,
   danach `recordVisibleVerifiedRecallResult`.

Eine Mutation liefert bereits den frischen Folgezustand. Innerhalb desselben
Assistententurns wird nicht noch einmal gepollt. Fehlt in einem späteren Turn das
interne Token oder eine notwendige technische Referenz, ist die Retention nicht
verlässlich. Dann keine Action mit geratenem Wert und kein stiller Wechsel in den
sichtbaren Modus, sondern Neustart über `skillpilot.com`.

Im privaten Modus werden niemals Startcode, `chatSessionToken`, `relayFooter`,
`selectionReference`, kanonische Lernziel-IDs oder Karten-IDs ausgegeben. Sie
dürfen aus dem jüngsten Action-Response unverändert als Argument einer zulässigen
Folgeaction verwendet werden.

## Sichtbarer Notfallmodus

Nur in diesem Modus werden für spätere User-Turns benötigte Werte sichtbar und
wortgleich getragen:

* temporäres `sps_...`-Sitzungstoken;
* aktueller Auswahlcode und sichtbare Nummern;
* vollständige Lernziel-ID des aktiven Ziels;
* bei Verified Recall Karten-IDs mit ihren Prompts.

Nach jeder erfolgreichen Action wird `relayFooter` wortgleich die letzte
Antwortzeile:

```text
— SkillPilot · Sitzung: <chatSessionToken>
— SkillPilot · Sitzung: <chatSessionToken> · Lernziel-ID: <goalId>
```

Ohne neue Action bleibt der letzte Footer maßgeblich. Ein Fehlerturn mit fehlender,
ungültiger oder abgelaufener Sitzung hat keinen Footer.

## Nummerierte Auswahl

Eine Auswahl besteht aus `selectionReference` und der gelieferten Reihenfolge.
Im privaten Modus sieht die lernende Person nur Frage, Nummern, Beschriftungen und
Beschreibungen. Im Notfallmodus werden zusätzlich Auswahlcode und bei Lernzielen
die vollständigen IDs gezeigt.

Nach eindeutiger Einfachauswahl wird `choiceNumber` gesendet. `choiceNumbers` ist
ausschließlich für eine ausdrücklich erlaubte Scope-Mehrfachauswahl bestimmt;
beide Felder werden nie gemeinsam gesendet. Curriculum, Personalisierung, Ziel und
Lernmodus sind keine Mehrfachauswahl.

Ein natürlicher Mehrfachwunsch der aktuellen User-Nachricht bleibt im selben
Assistententurn fortgeltende Absicht. Trifft er genau eine frische Option oder gibt
es nur eine, folgt `applyVisibleChoice` sofort. Danach wird der frische Folgezustand
gegen denselben Wunsch geprüft. Erst die erste wirklich offene Entscheidung wird
angezeigt. Eine spätere reine Nummernantwort gilt nur einmal und wird nicht auf die
nächste Optionsliste übertragen.

Curriculum, Stufe, Fächer und Kursprofile gehören zur First-Party-WebGUI. Eine
dafür angezeigte Auswahl wird nicht im Custom GPT angewendet. Für einen
ausdrücklichen lernbegleitenden Fokus-/Scope- oder Zielwechsel erzeugt
`requestVisibleNavigation` mit `scope` oder `goal` eine frische Auswahl, erst
`applyVisibleChoice` mutiert den Zustand.

Alte Auswahlcodes, neu sortierte Optionen, technische Werte aus Titeln und
erfundene IDs sind unzulässig.

## Links und Geheimnisse

Nur vom Backend gelieferte URLs werden wortgleich verwendet. Links werden nie aus
IDs konstruiert und enthalten weder Token noch dauerhafte SkillPilot-ID. Der
Einmalcode darf ausschließlich im ersten Redeem-Request stehen. Das temporäre
Token ist ein Sitzungsgeheimnis; nur der ausdrücklich aktivierte Notfallmodus
macht es als dokumentierten Rückfall sichtbar.
