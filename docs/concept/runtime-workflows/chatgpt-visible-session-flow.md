# SkillPilot Lerncoach: aktuelle ChatGPT-Visible-Session-Architektur

Status: aktuelle Standardarchitektur seit 21. Juli 2026.

Dieses Dokument beschreibt den produktseitig aktiven Start- und Dialogfluss der
beiden bestehenden SkillPilot Custom GPTs für Deutsch und Englisch. Die
Konfiguration wird **Visible Session** genannt, weil alle Werte, die ein späterer
ChatGPT-Action-Aufruf benötigt, sichtbar durch den Dialog getragen werden.

Die Architektur ist ein Workaround für die beobachtete ChatGPT-Regression, bei der
ein Custom GPT Werte aus einem früheren unsichtbaren Action-Response nach dem
nächsten User-Turn nicht mehr zuverlässig wiederverwenden kann. Das Backend bleibt
die Autorität für Lernstand, State Machine, erlaubte Übergänge und Mastery.

Die frühere Startcode-/Redeem-Architektur ist nicht der aktuelle Laufzeitpfad. Sie
bleibt vollständig als koordinierte Rollback-Variante erhalten und ist in
[ChatGPT-Startcode-/Session-Flow (Legacy)](chatgpt-startcode-session-flow.md)
dokumentiert.

## Architekturgrenzen

| Bereich | Kennt die dauerhafte SkillPilot-ID? | Kennt das temporäre Sitzungstoken? |
| --- | --- | --- |
| Browser/Cockpit | ja | beim Start kurzzeitig ja |
| SkillPilot-Backend | ja; löst intern die Sitzung darauf auf | nur gehasht gespeichert |
| ChatGPT/Custom GPT | nein | ja; sichtbar im Chat |
| Links aus dem Coach | nein | nein |

Die dauerhafte SkillPilot-ID bleibt im Browser und im SkillPilot-Backend. Das
sichtbare `sps_...`-Token ist dagegen ein temporärer Bearer-Zugriff auf genau den
zugeordneten pseudonymen Lernstand. Es ist standardmäßig 24 Stunden gültig und
serverseitig auf höchstens 24 Stunden begrenzt. Die Laufzeit ist absolut und wird
durch Nutzung nicht verlängert.

Weil das Token in der Unterhaltung steht, dürfen aktuelle Chat-Exporte,
Freigabelinks oder Screenshots mit diesem Footer während der Laufzeit nicht
öffentlich geteilt werden. Globale Lernziel-IDs sind dagegen bewusst sichtbare,
stabile fachliche Referenzen und keine Zugangsdaten.

## Startfluss

```text
Browser/Cockpit        SkillPilot-Backend       bestehender DE- oder EN-GPT
      |                         |                           |
      | POST .../visible-chat-start                        |
      |------------------------>|                           |
      |                         | Sitzung erzeugen,         |
      |                         | Token hashen, ID binden   |
      |<------------------------| Prompt + sps_... + Ablauf |
      |                                                     |
      | ChatGPT-URL mit vorbereitetem Prompt öffnen         |
      |---------------------------------------------------->|
      |                                                     |
      | User sendet die sichtbare Nachricht                 |
      |---------------------------------------------------->|
      |                         |<--------------------------|
      |                         | getVisibleState(sps_...)  |
      |                         |-------------------------->|
      |<----------------------------------------------------|
      | Antwort mit wortgleichem SkillPilot-Footer          |
```

Im Einzelnen:

1. Das Cockpit kennt die aktive SkillPilot-ID und ruft
   `POST /api/ui/learners/{skillpilotId}/visible-chat-start` auf.
2. Das Backend erzeugt direkt ein zufälliges `sps_...`-Sitzungstoken, speichert nur
   dessen HMAC-Hash und bindet die Sitzung intern an den Lernstand.
3. Der vorbereitete deutsche oder englische Prompt enthält das Token genau einmal.
   Ein vorhandener Prompt-Kontext wird von SkillPilot-ID, weiteren Sitzungstokens
   und alten Startcodes bereinigt.
4. Das Web-Frontend öffnet die feste URL des bestehenden sprachlich passenden GPTs
   mit diesem Prompt. Es wird kein neuer GPT angelegt.
5. Die lernende Person sendet die vorbereitete Nachricht in ChatGPT ab.
6. Der GPT ruft sofort `getVisibleState` auf und übernimmt den vom Backend
   gelieferten `relayFooter` wortgleich als letzte Zeile seiner Antwort.

Es gibt in diesem Ablauf weder einen Startcode noch eine Redeem-Action.

## Sichtbarer turnübergreifender Zustand

Der Coach verlässt sich nicht darauf, dass ein unsichtbarer Action-Response einen
späteren User-Turn überlebt. Nur Werte, die für eine spätere Action tatsächlich
benötigt werden, erscheinen sichtbar im Dialog:

- das temporäre Sitzungstoken im SkillPilot-Footer;
- bei aktivem Ziel zusätzlich die vollständige globale Lernziel-ID;
- ein zeitlich lokaler Auswahlcode mit nummerierten Optionen;
- bei Verified Recall die Karten-ID zusammen mit dem Kartenprompt.

Curriculum-, Filter-, Personalisierungs- und Scope-IDs bleiben im Backend. Der
Benutzer wählt dafür natürliche Beschriftungen über sichtbare Nummern. Das Backend
ordnet Auswahlcode und Nummer anschließend den technischen Werten zu. So werden
interne Schlüssel nicht unnötig in die Unterhaltung verlagert.

Der Footer hat genau eine der folgenden Formen:

```text
— SkillPilot · Sitzung: sps_...
— SkillPilot · Sitzung: sps_... · Lernziel-ID: <vollständige Lernziel-ID>
```

Die englische Variante verwendet `Session` und `Learning goal ID`. Nach jeder
erfolgreichen Action liefert das Backend den vollständigen Footer neu. Die
GPT-Instruktionen verlangen, dass er unverändert die letzte Antwortzeile bleibt.
Das ist ein instruktionsgestützter Vertrag: Das Backend kann nicht erzwingen, dass
ein Modell den Footer korrekt ausgibt, und die End-to-End-Tests müssen dieses
Verhalten deshalb ausdrücklich prüfen.

## Refresh-Gate pro User-Turn

Vor jeder substanziellen Antwort auf einen neuen normalen User-Turn lädt der GPT
mit dem Token aus dem letzten sichtbaren Footer den aktuellen Zustand erneut über
`getVisibleState`. Dadurch kommen aktives Ziel, Frontier, Fortschritt, Ressourcen
und State Machine aus dem Backend statt aus alter Gesprächserinnerung. Das gilt
auch nach langer Unterhaltung, Kontextkompaktierung oder einem Ausflug ins
Cockpit.

Nur drei bereits sichtbar vorbereitete Abläufe beginnen ohne diesen normalen
Refresh:

1. Antwort auf eine aktuelle nummerierte Auswahl → `applyVisibleChoice`;
2. vollständige sichtbare Prüfungsabgabe → `getVisibleExamEvaluation`;
3. Antwort auf sichtbare Lernkarten → `getVisibleVerifiedRecallAnswer`, danach
   `recordVisibleVerifiedRecallResult`.

Ihre Parameter müssen bereits vollständig im sichtbaren Dialog stehen. Ein im
selben Assistententurn frisch gelieferter Wert darf direkt an die nächste Action
weitergereicht werden.

## Natürliche Mehrfachwünsche innerhalb eines Assistententurns

Eine Formulierung wie „Ich möchte Mathe in der Oberstufe in Hessen lernen“ wird
innerhalb des aktuellen Assistententurns als fortgeltende Absicht behandelt. Wenn
der frische Zustand für eine Dimension genau eine inhaltlich passende Option
enthält, darf der GPT diese Auswahl sofort anwenden, den neuen Zustand laden und
denselben Wunsch gegen die nächste Auswahl prüfen. Eindeutige Zwischenauswahlen
und ihre Auswahlcodes werden nicht ausgegeben. Erst die erste wirklich offene
Entscheidung erzeugt eine sichtbare Rückfrage.

Dieser Ablauf ist auf einen Assistententurn begrenzt. Eine spätere reine
Nummernantwort beantwortet genau die sichtbare Auswahl, zu der ihr Auswahlcode
gehört; sie darf nicht automatisch auf eine danach gelieferte Optionsliste
übertragen werden. Ein Wunsch über mehrere Setup-Dimensionen ist außerdem eine
Folge von Einfachauswahlen und keine Scope-Mehrfachauswahl über `choiceNumbers`.

Das beseitigt unnötige Zwischenfragen, löst aber nicht jede Formulierung allein
durch Prompting. Insbesondere kann „Oberstufe“ nur automatisch aufgelöst werden,
wenn die aktuelle Backend-Auswahl eine passende Stufen- oder Composition-View-
Option tatsächlich anbietet. Die heutige Visible-Session-Oberfläche bildet diese
Dimension nicht in jedem Zustand als eigene Option ab. Der GPT darf dann keine
erfundene Auflösung behaupten, sondern muss bei der ersten echten Lücke stoppen.
Die strategische Ablösung dieser Host-Abhängigkeit beschreibt die
[SkillPilot-eigene Lerncoach-Zielarchitektur](skillpilot-owned-coach-architecture.md).

## Action-Oberfläche und Workflow-Abdeckung

Jede Sprachvariante besitzt ein eigenständiges, fest auf `/de/` beziehungsweise
`/en/` begrenztes OpenAPI-Schema. Die neun Actions bilden die vollständigen
aktuellen Coach-Abläufe ab:

| Action | Methode und Suffix unter `/visible` | Aufgabe im Workflow |
| --- | --- | --- |
| `getVisibleState` | `GET /state` | aktuellen Backend-Zustand und den Pflichtfooter laden |
| `applyVisibleChoice` | `POST /choice` | eine sichtbare Nummer oder erlaubte Scope-Mehrfachauswahl anwenden |
| `requestVisibleNavigation` | `POST /navigation` | Auswahl für Curriculum, Personalisierung, Scope oder Zielwechsel erzeugen, ohne Zustand zu ändern |
| `setVisibleActiveGoal` | `POST /active-goal` | eine bereits vollständig sichtbare Lernziel-ID aktivieren |
| `setVisibleMastery` | `POST /mastery` | nach ausreichender Evidenz Mastery `1.0` für das aktive Ziel speichern |
| `startVisibleVerifiedRecall` | `POST /verified-recall/start` | einen sichtbaren Kartenbatch für ein Memorierungsziel beginnen |
| `getVisibleVerifiedRecallAnswer` | `POST /verified-recall/answer` | Sollantwort erst nach sichtbarer Lernendenantwort laden |
| `recordVisibleVerifiedRecallResult` | `POST /verified-recall/result` | fachlich bewertetes Kartenergebnis speichern |
| `getVisibleExamEvaluation` | `POST /exam/evaluation` | Lösung und Scoring instruktionsgestützt erst nach vollständiger sichtbarer Prüfungsabgabe laden |

Die geringere Methodenzahl gegenüber dem Legacy-Schema bedeutet keine geringere
Workflow-Abdeckung. Setup- und Navigationsschritte sind bewusst in
`requestVisibleNavigation` plus `applyVisibleChoice` konsolidiert. Die Action kennt
die Backend-Schlüssel, während die Unterhaltung nur Beschriftung, Nummer und
Auswahlcode tragen muss.

Normale State-Responses werden durch die gemeinsame providerneutrale
`CoachStateProjection` vorbereitet. Sie enthalten bei Prüfungszielen nur
Aufgabentext, Maximalpunkte und Bildhinweis, aber niemals Lösung,
Bestehensgrenze, Quellpfad oder Bewertungsraster. Die explizite Evaluation
delegiert an den gemeinsamen, fachlich autorisierten Exam-Use-Case der
`CoachToolFacade`; das bestehende Visible-Session-Schema bleibt dabei unverändert. Bei
Verified Recall wird die Sollantwort erst nach der Antwort der lernenden Person
freigegeben. Memorierungs-Mastery wird vom Backend aus den gespeicherten
Kartenergebnissen abgeleitet und nicht über `setVisibleMastery` gesetzt.

Der Exam-Use-Case prüft aktives Ziel, Prüfungstyp, Freigabestatus und vollständige
Evaluationsdaten. Er beweist im heutigen Custom-GPT-Kanal jedoch nicht unabhängig,
dass zuvor wirklich eine Lernendenantwort abgegeben wurde: Der Backend-Request
enthält weiterhin nur die sichtbare Lernziel-ID, und SkillPilot erhält bewusst
kein Chatprotokoll. Die Reihenfolge „sichtbare vollständige Abgabe, danach
Evaluation“ bleibt deshalb instruktionsgestützt. Ein starker Abgabenbeweis braucht
später eine direkte SkillPilot-Widget- oder Cockpit-Abgabe mit Attempt-ID.

Die Bewertung ist kriteriums- statt wortlautbezogen. `solutionContent` ist eine
Referenzlösung, kein exklusiver Lösungsweg. Fachlich gleichwertige Darstellungen,
zulässige Rundungen, eigene tragfähige Begründungen und korrekte alternative Wege
erhalten dieselben Punkte, sofern Aufgabe oder Raster keine bestimmte Antwortform
ausdrücklich verlangt; ausdrückliche Anforderungen bleiben verbindlich. Die Abgabe
wird ohne Rückfragedialog abschließend bewertet. Eine unleserliche Bild- oder
Handschriftstelle wird als unleserlich und
nur anhand sicher erkennbarer Evidenz gewertet; der GPT darf daraus keinen
bestimmten fachlichen Fehler erfinden.

Die dauerhafte gemeinsame Architekturgrenze und die bewusst zurückgestellten
Revision-/Idempotenzmechanismen sind unter
[Provider-Neutral Learning-Coach Boundary](provider-neutral-coach-boundary.md)
dokumentiert.

Alle neun Operationen:

- liegen unter `/api/ai/{de|en}/sessions/{chatSessionToken}/visible/...`;
- verwenden die konfigurierte Bearer-Authentifizierung der GPT Action;
- tragen `x-openai-isConsequential: false`;
- definieren `chatSessionToken` direkt und mit einem String-Namen im jeweiligen
  Pfad statt über einen wiederverwendbaren Parameter-`$ref`.

Die Inline-Definition ist eine Kompatibilitätsmaßnahme für den GPT Builder, der die
betroffenen Operationen bei einem Parameter-`$ref` derzeit überspringt.

## Sprachpakete und bestehende GPTs

Die beiden bestehenden GPTs werden in place konfiguriert. Jede Sprachvariante hat
ein vollständiges eigenes Paket mit:

- eigenen System Instructions;
- genau sieben eigenen Knowledge-Dokumenten;
- einem eigenen locale-festen `skillpilot-api-4ai.*.json`;
- einem maschinengeprüften Bundle-Manifest, das nicht als Knowledge hochgeladen
  wird.

Maßgebliche Quellen und Builder-Anleitungen:

- [Visible-Session-Paket](../../../ai/openai-custom-gpt-visible-session/README.md)
- [deutsches Builder-Setup](../../../ai/openai-custom-gpt-visible-session/de/gpt_setup_guide.md)
- [englisches Builder-Setup](../../../ai/openai-custom-gpt-visible-session/en/gpt_setup_guide.md)

Die Sprachschemata dürfen nicht zusammengeführt oder gegeneinander ausgetauscht
werden. Unter `ai/` gibt es absichtlich kein gemeinsames
`skillpilot-api-4ai.*`-Fallback.

## Laufzeitwahl, Rollout und Rollback

Das Web-Frontend verwendet `visible-session` ohne Coach-spezifische
Umgebungsvariable als Standard. Die festen URLs der bestehenden deutschen und
englischen GPTs liegen im sprachspezifischen Frontend-Paket. Die gewöhnlichen
Produktionsgeheimnisse des Backends, insbesondere Action-API-Key und Signing
Secret, bleiben davon unberührt und müssen weiterhin korrekt konfiguriert sein.

Ein Rollout erfolgt koordiniert:

1. Backend mit den `/visible/...`-Routen deployen.
2. Web-Frontend mit der Standardvariante deployen.
3. Bestehenden deutschen GPT nur mit dem deutschen Visible-Session-Bundle
   aktualisieren.
4. Bestehenden englischen GPT nur mit dem englischen Bundle aktualisieren.
5. Pro Sprache einen frischen End-to-End-Test durchführen.

Für einen Rollback werden zuerst beide bestehenden GPTs aus den unveränderten
Quellen unter `ai/openai custom gpt/` auf die passende Legacy-Konfiguration
zurückgesetzt. Erst danach wird das Web-Frontend mit
`VITE_SKILLPILOT_COACH_VARIANT=legacy` gebaut. Nur eine Seite umzuschalten würde
ein Visible-Session-Token an ein Startcode-Schema oder einen Startcode an das
Visible-Session-Schema senden und ist unzulässig.

## Fehler- und Betriebsregeln

- Bei `410` beziehungsweise `chat_session_expired` stoppt der Coach Actions und
  Unterricht. Die lernende Person startet den Coach erneut über `skillpilot.com`.
- Bei `401`, Schema- oder Speicherfehlern wird kein Erfolg behauptet.
- Bei `409` wird der Zustand höchstens einmal neu geladen; alte Auswahlcodes werden
  nicht wiederverwendet.
- URLs werden nur aus dem letzten Backend-Response übernommen. Token und
  SkillPilot-ID gehören nie in Links.
- Da das Token als Pfadparameter übertragen wird, müssen Application-, Reverse-
  Proxy- und Access-Logs Pfade und Bodies dieser Routen redigieren oder auslassen.
- Der SkillPilot-Server erhält keine Chatprotokolle. Der Dialog und hochgeladene
  Inhalte unterliegen dennoch den Regeln des verwendeten ChatGPT-Kontos.

## Verifikation

Die paketlokale Architekturprüfung läuft mit:

```bash
npm test --prefix ai/openai-custom-gpt-visible-session
```

Die Frontend-Variantenprüfung läuft mit:

```bash
npm --prefix app run test:coach-variants
```

Zusätzlich braucht jeder Builder-Rollout einen echten DE- und EN-Acceptance-Test:
Start, Turn-Refresh, nummerierte Auswahl, sichtbarer Footer, Zielwechsel, Mastery,
Verified Recall, Prüfung, Ablauf und Neustart.

## Claude-Abgrenzung

Die Claude-OAuth/MCP-Implementierung ist eine getrennte, derzeit deaktivierte und
nicht lernendenseitig sichtbare Variante. Sie verwendet keinen sichtbaren
ChatGPT-Sitzungsfooter. Gemeinsame Projektion, Personalisierung und
Exam-Autorisierung sind im Code ergänzt; ohne vollständige reale
Provider-Acceptance ist Claude dennoch kein Fallback des aktuellen Coachs. Der
Status und die verbleibenden Release-Gates stehen im
[Claude-Coach-Runbook](../../deploy/claude-coach-beta.md).
