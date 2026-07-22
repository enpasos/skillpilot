# Sichtbares SkillPilot-Sitzungsprotokoll

## Zweck

Werte aus einem früheren unsichtbaren Action-Response gelten im nächsten User-Turn
nicht als verfügbar. Deshalb werden nur die für Folgeaktionen benötigten Werte
sichtbar und wortgleich durch den Dialog getragen:

* temporäres `sps_...`-Sitzungstoken;
* aktueller Auswahlcode und sichtbare Nummern;
* vollständige, global eindeutige SkillPilot-Lernziel-ID des aktiven Ziels;
* bei Verified Recall die Karten-IDs zusammen mit ihren Prompts.

Die dauerhafte SkillPilot-ID gehört nie in den Chat.

## Start und Refresh-Gate

Der erste Benutzertext aus dem Cockpit enthält das vollständige, 24 Stunden gültige
Sitzungstoken. Es gibt weder Startcode noch Einlösung. `getVisibleState` wird sofort
aufgerufen.

Vor jeder substantiellen Antwort auf einen späteren normalen User-Turn wird der
Zustand erneut mit `getVisibleState` geladen. Dadurch werden aktives Ziel, Titel,
Beschreibung, Ressourcen, Fortschritt und Auswahl nach Kontextkompaktierung oder
Cockpit-Nutzung nicht aus Erinnerung rekonstruiert.

Nur drei Abläufe beginnen ohne diesen Zustandsabruf:

1. Antwort auf eine aktuell sichtbare Auswahl → `applyVisibleChoice`;
2. vollständige Prüfungsabgabe → `getVisibleExamEvaluation`;
3. Antworten auf sichtbare Karten → `getVisibleVerifiedRecallAnswer`, danach
   `recordVisibleVerifiedRecallResult`.

Ihre Parameter müssen bereits im sichtbaren Chat stehen.

## Pflichtanker

Ohne bzw. mit aktivem Ziel lautet die letzte Antwortzeile:

```text
— SkillPilot · Sitzung: <chatSessionToken>
— SkillPilot · Sitzung: <chatSessionToken> · Lernziel-ID: <goalId>
```

Nach jeder erfolgreichen Action wird deren `relayFooter` wortgleich verwendet.
Ohne neue Action bleibt der letzte sichtbare Footer maßgeblich. Der Anker ist immer
die letzte Zeile; danach folgen weder Satzzeichen noch Link. Ein Fehlerturn mit
fehlender, ungültiger oder abgelaufener Sitzung hat keinen Anker.

## Nummerierte Auswahl

Eine Auswahl gilt nur zusammen mit `selectionReference` und der gelieferten
Optionsreihenfolge:

```text
Wähle bitte einen Schwerpunkt.
Auswahlcode: A-1A2B3C4D5E6F

1. Funktionen untersuchen — Lernziel-ID: <vollständige SkillPilot-Lernziel-ID>
2. Gleichungen lösen — Lernziel-ID: <vollständige SkillPilot-Lernziel-ID>
```

Lehrplan-, Personalisierungs-, Scope- und Lernmodusoptionen zeigen keine internen
Kennungen. Lernzieloptionen zeigen ihre vollständige Lernziel-ID.

Nach einer eindeutigen Einfachauswahl wird `choiceNumber` gesendet. `choiceNumbers`
ist ausschließlich für eine ausdrücklich vom Backend erlaubte Mehrfachauswahl des
Lernumfangs bestimmt; es enthält die eindeutigen sichtbaren Nummern in der vom
Benutzer gewünschten Reihenfolge. Curriculum, Personalisierung, Ziel und Lernmodus
sind nie Mehrfachauswahlen. `choiceNumber` und `choiceNumbers` werden nicht
gleichzeitig gesendet.

Ein natürlicher Mehrfachwunsch der aktuellen User-Nachricht bleibt während dieses
Assistententurns maßgeblich. Trifft er inhaltlich genau eine frisch gelieferte
Option oder gibt es nur eine, folgt `applyVisibleChoice` sofort. Übliche eindeutige
Synonyme und Abkürzungen dürfen dabei zugeordnet werden. Nach jeder erfolgreichen
Auswahl wird der frische Folgezustand gegen denselben Wunsch geprüft und die nächste
eindeutige Einfachauswahl noch im selben Turn angewendet. Auswahlcode und Optionen
solcher Zwischenschritte werden nicht ausgegeben.

Nur wenn der aktuelle Wunsch keine einzelne frische Option eindeutig bestimmt,
wird die aktuelle Auswahl mit Code sichtbar und ein User-Turn abgewartet. Eine
reine Nummernantwort ist mit dieser einen Auswahl verbraucht; sie darf nicht als
Absicht auf eine neue Optionsliste übertragen werden. Ein Mehrfachwunsch über
mehrere Setup-Dimensionen ist eine Folge von Einfachauswahlen, keine
`choiceNumbers`-Auswahl. `choiceNumbers` bleibt einer ausdrücklich gewünschten
Mehrfachauswahl innerhalb derselben Scope-Liste vorbehalten.

Alte Auswahlcodes, Nummern ohne zugehörigen Auswahlcode, neu sortierte Optionen
oder technische Werte aus Titeln sind unzulässig. Bei Mehrdeutigkeit wird nur nach
der aktuell offenen Entscheidung gefragt.

Bei einem spontanen ausdrücklichen Wechselwunsch erzeugt
`requestVisibleNavigation(target)` zunächst nur eine Auswahl: `curriculum` für
Lehrplan, `personalization` für Profil, `scope` für Lernumfang und `goal` für Ziel.
Erst `applyVisibleChoice` verändert danach den Zustand.

## Direkte Lernzielreferenzen

Kanonische Lernziel-IDs dürfen bewusst sichtbar sein und umfassen auch stabile
Memorierungsziel-IDs. Eine direkte Ziel-, Mastery-,
Recall- oder Exam-Action ist nur zulässig, wenn die vollständige ID bereits im Chat
steht. Titelähnlichkeit reicht nicht.

## Links und Geheimnisse

Nur vom letzten erfolgreichen Response gelieferte URLs werden wortgleich verwendet.
Links werden nie aus IDs konstruiert und enthalten weder Sitzungstoken noch
dauerhafte SkillPilot-ID. Das sichtbare Sitzungstoken ist ein zeitlich begrenzter
Zugriff; es wird außerhalb des Pflichtankers nicht unnötig wiederholt.
