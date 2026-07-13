# Deep-Research-Auftrag: Custom-GPT-Action-Ergebnisse ueber Nutzer-Turns

## Auftrag

Untersuche unabhaengig und quellenbasiert, ob ChatGPT Custom GPTs rohe Ergebnisse einer GPT Action innerhalb desselben Chats ueber den naechsten Nutzer-Turn hinweg wiederverwenden koennen oder laut OpenAI-Dokumentation wiederverwenden duerfen. Klaere ausserdem, ob sich dieses Verhalten im zeitlichen Umfeld des GPT-5.6-Rollouts geaendert hat.

Die Recherche darf weder voraussetzen, dass GPT-5.6 die Ursache ist, noch dass OpenAI turnuebergreifende Persistenz von Action-Ergebnissen vertraglich zugesichert hat. Trenne dokumentierte Produktsemantik, beobachtetes Verhalten, historische Aenderungen und plausible, aber unbestaetigte Erklaerungen strikt voneinander.

Recherche-Stichtag: 13. Juli 2026.

## Konkrete Beobachtung

Ein privater, gespeicherter Custom GPT namens `RegressionGPT` verwendet genau zwei unauthentisierte Actions. Die erste Action liefert bei jedem Aufruf ein frisches, nicht vorhersagbares und serverseitig signiertes Tupel:

```json
{
  "probe_id": "<frische UUID>",
  "token": "<frischer Zufallswert>",
  "proof": "<HMAC-basierter Nachweis>"
}
```

Die zweite Action prueft serverseitig, ob genau dieses Tupel unveraendert weitergegeben wurde.

Unter dem sichtbar ausgewaehlten Modus GPT-5.6 Sol, Thinking, Denkaufwand Standard wurden folgende Ergebnisse beobachtet:

1. `RUN_SINGLE`: bestanden. Frische Werte aus der Action-Antwort wurden unmittelbar in der sichtbaren Antwort korrekt ausgegeben.
2. `RUN_CHAIN`: bestanden. Innerhalb desselben Assistant-Turns wurde das frische Tupel korrekt an eine zweite Action uebergeben; der Server bestaetigte die Signatur mit `proof_valid=true`.
3. In einem neuen Chat `RUN_RETAIN`: Die Action wurde ausgefuehrt und der GPT antwortete wie verlangt mit `RETAIN_READY`. Seine Instructions verlangten, `probe_id` und `token` fuer den naechsten Nutzer-Turn intern zu behalten und nicht auszugeben.
4. Direkt danach im selben Chat `RECALL_RETAIN`: Erwartet war `RETAIN token=<vorheriger Token>`, ohne eine neue Action auszufuehren. Tatsaechlich antwortete der GPT `RETAIN_MISSING`.

Der Screenshot belegt dieselbe Conversation-URL und die sichtbaren Antworten. Das Spring-Audit soll separat bestaetigen, dass im ersten Turn genau eine Probe erzeugt und im zweiten Turn keine weitere Action ausgefuehrt wurde.

Wichtige Aussagegrenze: `RETAIN_READY` beweist fuer sich allein nicht, dass der Wert intern dauerhaft gespeichert wurde. `RETAIN_MISSING` kann bedeuten, dass der rohe Action-Output im Folgeturn nicht im Modellkontext vorhanden war; es kann aber auch eine andere Form von Instruction-Following-, Kontextselektions-, Sicherheits- oder Routingverhalten sein. Ohne OpenAI-interne Traces darf keine konkrete interne Fehlerstelle behauptet werden.

## Bezug zu SkillPilot

Der reale SkillPilot Coach verwendet einen mehrturnigen Lernablauf:

1. `redeemStartCode` liefert einen kurzlebigen `chatSessionToken`, eine verschachtelte Lernzustandsantwort und `stateMachine.requiredAction`.
2. In spaeteren Nutzer-Turns muss der GPT denselben `chatSessionToken` als Pfadparameter weiterer Actions verwenden.
3. Der produktive Token ist ein beliebiger Anwendungswert aus einer API-Antwort. Er ist nicht das von ChatGPT verwaltete API-Key- oder OAuth-Credential der Action.

Der Minimaltest legt deshalb eine moegliche Erklaerung fuer das Produktionsproblem nahe, beweist diese Verbindung aber noch nicht.

## Zentrale Forschungsfragen

Beantworte mindestens die folgenden Fragen einzeln:

1. Welche aktuelle, offizielle OpenAI-Dokumentation beschreibt, welche Bestandteile eines GPT-Action-Aufrufs in folgenden Modell-Turns verfuegbar sind?
2. Gibt es eine ausdrueckliche Zusage, dass rohe Action-Responses oder einzelne daraus gelesene Werte im naechsten Nutzer-Turn desselben Chats enthalten bleiben?
3. Gibt es eine ausdrueckliche Einschraenkung oder Sicherheitsregel, nach der Action-Outputs nur fuer den aktuellen Assistant-Turn verfuegbar sind?
4. Unterscheidet OpenAI dokumentarisch zwischen:
   - mehreren Actions innerhalb eines Assistant-Turns,
   - der sichtbaren Assistant-Antwort,
   - dem naechsten Nutzer-Turn im selben Chat,
   - Saved Memory beziehungsweise Chat History,
   - einem neuen Chat?
5. Ist der dokumentierte zweistufige Weather.gov-Flow nur ein Same-Turn-Beispiel, oder laesst er belastbare Rueckschluesse auf Cross-Turn-Verhalten zu?
6. Werden sensible oder tokenartig benannte Felder wie `token`, `access_token`, `secret`, `session`, lange Zufallswerte oder HMACs anders behandelt als neutrale Felder wie `nonce`, `probe_id`, `color` oder eine kurze Zahl?
7. Gibt es dokumentierte Redaktions-, Safety-, Prompt-Injection- oder Context-Compaction-Aenderungen, die rohe Tool-/Action-Ergebnisse aus spaeteren Turns entfernen oder zusammenfassen koennten?
8. Gibt es offizielle Release Notes, Statusmeldungen, bekannte Probleme oder bestaetigte Supportaussagen im Umfeld des GPT-5.6-Rollouts, die Custom GPT Actions, Function Calling, Tool Results oder mehrturnige Kontexte betreffen?
9. Seit wann berichten Entwickler ueber vergleichbare Symptome? Suche nach Berichten mit konkreten Zeitangaben, Modell-/Modusangaben und reproduzierbaren Schritten.
10. Sind die Berichte wirklich neu oder existierten dieselben Einschraenkungen bereits bei GPT-4o, GPT-5.x oder aelteren Custom GPTs?
11. Haengt das Verhalten nachweislich von Modell, Reasoning-Stufe, Auto-Routing, Builder Preview, gespeichertem privaten GPT, Workspace-Richtlinien oder Account-Typ ab?
12. Sendet eine GPT Action einen dokumentierten, stabilen Benutzer-, Chat- oder Conversation-Identifier an den Anwendungsserver, mit dem serverseitiger Zustand ohne vom Modell behaltenen Token sicher korreliert werden kann? Wenn nein, sage dies ausdruecklich als Dokumentationsbefund und nicht als absolute technische Behauptung.
13. Welche Unterschiede bestehen zwischen:
    - einem beliebigen Token in der Action-Response,
    - einem im GPT-Editor hinterlegten API Key,
    - einem von ChatGPT verwalteten benutzerspezifischen OAuth Access Token?
14. Ist OAuth der offiziell vorgesehene Weg, eine stabile personalisierte Identitaet ueber mehrere Action-Aufrufe zu transportieren?
15. Welche belastbaren Architektur-Alternativen gibt es fuer einen mehrturnigen Lerncoach, falls beliebige Action-Response-Werte nicht verlaesslich turnuebergreifend verfuegbar sind?

## Historische Recherche

Pruefe nach Moeglichkeit nicht nur den aktuellen Stand, sondern auch fruehere Fassungen:

- OpenAI-Dokumentation und Help-Center-Artikel vor und nach dem mutmasslichen GPT-5.6-Rollout
- offizielle ChatGPT Release Notes, Model Release Notes, Statusmeldungen und Changelogs
- archivierte Fassungen der GPT-Actions-Seiten, beispielsweise ueber das Internet Archive
- nachvollziehbare Aenderungshistorien offizieller Dokumentations-Repositories, sofern vorhanden
- datierte Aussagen von OpenAI-Mitarbeitenden oder Moderatoren, klar als solche gekennzeichnet

Erstelle eine kleine Zeitleiste. Trenne das Datum einer Veroeffentlichung vom Datum des beschriebenen Ereignisses.

## Quellenhierarchie

Priorisiere Quellen in dieser Reihenfolge:

1. aktuelle offizielle OpenAI-Dokumentation und Help Center
2. offizielle OpenAI Release Notes, Statusseite und Changelogs
3. archivierte offizielle Dokumentation
4. konkrete Aussagen identifizierbarer OpenAI-Mitarbeitender
5. OpenAI Developer Forum mit reproduzierbaren technischen Details
6. GitHub Issues, Stack Overflow und technische Blogposts mit Belegen
7. Reddit, soziale Medien und reine Erfahrungsberichte nur als Hinweis auf Verbreitung, nicht als Produktvertrag

Nutze unter anderem diese offiziellen Startpunkte und pruefe ihre aktuelle Fassung:

- https://developers.openai.com/api/docs/actions/introduction
- https://developers.openai.com/api/docs/actions/getting-started
- https://developers.openai.com/api/docs/actions/authentication
- https://developers.openai.com/api/docs/actions/production
- https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts
- https://help.openai.com/en/articles/8554397-creating-and-editing-gpts-with-actions
- https://help.openai.com/en/articles/8554407-gpts-faq

## Evidenzregeln

- Belege jede aktuelle oder historische Produktaussage mit einem direkten Link und Zugriffs- beziehungsweise Publikationsdatum.
- Zitiere knapp und paraphrasiere ueberwiegend.
- Kennzeichne jede Schlussfolgerung als `dokumentiert`, `direkt beobachtet`, `stark gestuetzte Inferenz`, `Hypothese` oder `unbekannt`.
- Das gemeinsame Auftreten mit einem Rollout ist keine Kausalitaet.
- Ein erfolgreicher Same-Turn-Flow beweist keine Cross-Turn-Persistenz.
- Sichtbare Chat-History, Saved Memory und der tatsaechlich an das Modell uebergebene Kontext sind verschiedene Konzepte.
- Das Fehlen einer Zusage ist kein Beweis fuer eine ausdrueckliche Nichtunterstuetzung.
- Community-Berichte duerfen eine offizielle Zusage weder ersetzen noch erzeugen.
- Keine geheimen Tokens, API Keys, Cookies oder personenbezogenen Lernerdaten wiedergeben.
- Keine SkillPilot- oder Regressionstest-Endpunkte aktiv aufrufen. Die Recherche ist zunaechst dokumentarisch; weitere Live-Tests brauchen gesonderte Freigabe.

## Empirische Kontrollmatrix bewerten

Bewerte, welche der folgenden kontrollierten Varianten die Ursache am besten eingrenzen wuerden:

| Variante | Erster Turn | Folgeturn | Zweck |
|---|---|---|---|
| Same-turn hidden | Action A -> Action B | keiner | bereits bestanden; unmittelbares Handoff |
| Cross-turn hidden token | Token nicht sichtbar | Token ohne Action abrufen | beobachtet fehlgeschlagen |
| Cross-turn hidden neutral ID | `probe_id` nicht sichtbar | `probe_id` abrufen | feldspezifische Redaktion pruefen |
| Cross-turn visible token | Token in Assistant-Text | Token wiederholen | sichtbaren Chatkontext kontrollieren |
| Cross-turn visible neutral value | neutraler Wert sichtbar | Wert wiederholen | allgemeine Chatkontrolle |
| Cross-turn Action verify | Token nicht sichtbar | zweite Action mit altem Token | serverseitig objektive Cross-Turn-Pruefung |
| Feldnamenvergleich | identische Entropie, andere Namen | Werte abrufen | Safety-/Secret-Heuristik pruefen |
| Modellvergleich | identische Konfiguration | identische Prompts | Modus-/Routingeffekt pruefen |

Empfiehl eine minimale Reihenfolge und erklaere, welche Schlussfolgerung jede Variante erlaubt und nicht erlaubt.

## Architektur-Alternativen

Bewerte mindestens diese Optionen fuer SkillPilot nach Dokumentationsgrad, Sicherheit, Aufwand und UX:

1. Weiterhin einen geheimen Session-Token ausschliesslich im verborgenen Action-Output halten.
2. Einen kurzlebigen, sichtbaren, opaken Session-Handle in jeder Assistant-Antwort mitfuehren.
3. Personalisierte GPT-Action-Authentisierung ueber OAuth, sodass ChatGPT den Access Token bei jedem Action-Aufruf automatisch sendet.
4. Einen zustandslosen, signierten Kontext in jeder Anfrage transportieren.
5. Serverseitige Session-Korrelation ueber einen offiziell dokumentierten stabilen Request-Identifier, falls ein solcher existiert.
6. Migration zu einer ChatGPT App/MCP-Integration mit dokumentierter Zustandsverwaltung.
7. Eigene Chat-Anwendung auf Basis der OpenAI Responses API mit explizit verwaltetem Conversation State.

Bei jeder Option: Keine nicht dokumentierten Header oder Identifikatoren erfinden. Sicherheitsrisiken eines im Chat sichtbaren Learner-Tokens klar benennen.

## Gewuenschtes Ergebnisformat

Erstelle den Bericht auf Deutsch mit folgender Struktur:

1. **Executive Summary**: maximal zehn belastbare Kernaussagen
2. **Antwort auf die Vertragsfrage**: Was garantiert OpenAI aktuell, was nicht?
3. **Einordnung des beobachteten Tests**: Was beweist `RETAIN_MISSING`, was nicht?
4. **Historische Zeitleiste**: Dokumentation, Rollouts und belastbare Berichte
5. **Vergleichbare Berichte**: Tabelle mit Datum, Modell, Oberflaeche, Symptom, Reproduzierbarkeit und Quellenqualitaet
6. **Hypothesenmatrix**: Evidenz dafuer, Evidenz dagegen, naechster unterscheidender Test
7. **Empfohlene Kontrolltests**: priorisiert und mit erwartbaren Aussagegrenzen
8. **Architekturempfehlung fuer SkillPilot**: kurzfristiger Workaround und langfristig dokumentierter Weg
9. **Ticket-faehige Formulierung**: sachlicher englischer Problemtext ohne unbewiesene GPT-5.6-Kausalitaet
10. **Offene Fragen an OpenAI**: konkrete Fragen, die nur OpenAI intern beantworten kann
11. **Quellenverzeichnis**: direkte Links, Titel, Datum und Quellenklasse

Schliesse mit genau einer der folgenden Gesamteinstufungen und begruende sie:

- `Dokumentierte Regression`
- `Wahrscheinliche Verhaltensaenderung bei nicht dokumentierter Garantie`
- `Bereits zuvor dokumentierte Einschraenkung`
- `Unzureichende Evidenz`

